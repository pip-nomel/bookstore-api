import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../schemas/book';
import { createReviewSchema } from '../schemas/review';
import { authenticate, requireAdmin } from '../middleware/auth';
import { NotFoundError, ValidationError, ConflictError } from '../lib/errors';

export const booksRouter = Router();

// GET /api/books/suggestions
booksRouter.get('/suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    if (!q) {
      return res.json({ data: [] });
    }

    const books = await prisma.book.findMany({
      where: { title: { contains: q }, deletedAt: null },
      select: { id: true, title: true },
      take: 5,
    });

    res.json({ data: books });
  } catch (err) {
    next(err);
  }
});

// GET /api/books
booksRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, categoryId } = bookQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [rawBooks, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    const books = rawBooks.map(({ reviews, ...book }) => ({
      ...book,
      reviewCount: reviews.length,
      avgRating: reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 100) / 100
        : null,
    }));

    res.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id
booksRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const book = await prisma.book.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!book) {
      throw new NotFoundError('Book');
    }

    const { reviews, ...rest } = book;
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 100) / 100
      : null;

    res.json({ data: { ...rest, reviews, reviewCount, avgRating } });
  } catch (err) {
    next(err);
  }
});

// POST /api/books (admin only)
booksRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createBookSchema.parse(req.body);

    const book = await prisma.book.create({
      data,
      include: { category: true },
    });

    res.status(201).json({ data: book });
  } catch (err) {
    next(err);
  }
});

// PUT /api/books/:id (admin only)
booksRouter.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const data = updateBookSchema.parse(req.body);

    const existing = await prisma.book.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundError('Book');
    }

    const book = await prisma.book.update({
      where: { id },
      data,
      include: { category: true },
    });

    res.json({ data: book });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/books/:id (admin only, soft delete)
booksRouter.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const existing = await prisma.book.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundError('Book');
    }

    await prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id/reviews
booksRouter.get('/:id/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = parseInt(req.params.id as string, 10);
    const book = await prisma.book.findFirst({ where: { id: bookId, deletedAt: null } });
    if (!book) {
      throw new NotFoundError('Book');
    }

    const reviews = await prisma.review.findMany({
      where: { bookId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: reviews });
  } catch (err) {
    next(err);
  }
});

// POST /api/books/:id/reviews
booksRouter.post('/:id/reviews', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = parseInt(req.params.id as string, 10);
    const data = createReviewSchema.parse(req.body);

    const book = await prisma.book.findFirst({ where: { id: bookId, deletedAt: null } });
    if (!book) {
      throw new NotFoundError('Book');
    }

    // Check if user has ordered this book (delivered)
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        bookId,
        order: {
          userId: req.user!.userId,
          status: { in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'] },
        },
      },
    });

    if (!hasOrdered) {
      throw new ValidationError('You can only review books you have ordered');
    }

    // Check for existing review
    const existing = await prisma.review.findUnique({
      where: { userId_bookId: { userId: req.user!.userId, bookId } },
    });
    if (existing) {
      throw new ConflictError('You have already reviewed this book');
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.userId,
        bookId,
        rating: data.rating,
        comment: data.comment,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
});
