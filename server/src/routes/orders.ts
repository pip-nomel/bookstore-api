import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from '../schemas/order';
import { authenticate, requireAdmin } from '../middleware/auth';
import { NotFoundError, ValidationError, ForbiddenError } from '../lib/errors';

export const ordersRouter = Router();

// GET /api/orders
ordersRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = orderQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = req.user!.role === 'ADMIN' ? {} : { userId: req.user!.userId };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { book: { select: { id: true, title: true, author: true } } } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
ordersRouter.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { book: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.userId) {
      throw new ForbiddenError('You can only view your own orders');
    }

    res.json({ data: order });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
ordersRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = createOrderSchema.parse(req.body);

    // Fetch all books and validate stock
    const bookIds = items.map((i) => i.bookId);
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds }, deletedAt: null },
    });

    if (books.length !== bookIds.length) {
      throw new ValidationError('One or more books not found');
    }

    const bookMap = new Map(books.map((b) => [b.id, b]));
    let totalPrice = 0;

    for (const item of items) {
      const book = bookMap.get(item.bookId)!;
      if (book.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for "${book.title}". Available: ${book.stock}, requested: ${item.quantity}`);
      }
      totalPrice += book.price * item.quantity;
    }

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Create order with items
      return tx.order.create({
        data: {
          userId: req.user!.userId,
          totalPrice: Math.round(totalPrice * 100) / 100,
          items: {
            create: items.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: bookMap.get(item.bookId)!.price,
            })),
          },
        },
        include: {
          items: { include: { book: { select: { id: true, title: true } } } },
        },
      });
    });

    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status (admin only)
ordersRouter.patch('/:id/status', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { status } = updateOrderStatusSchema.parse(req.body);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundError('Order');
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { book: { select: { id: true, title: true } } } },
      },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/cancel
ordersRouter.post('/:id/cancel', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.userId) {
      throw new ForbiddenError('You can only cancel your own orders');
    }

    if (order.status !== 'PENDING') {
      throw new ValidationError('Only PENDING orders can be cancelled');
    }

    // Cancel and restore stock
    const updated = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          items: { include: { book: { select: { id: true, title: true } } } },
        },
      });
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});
