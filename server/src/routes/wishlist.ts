import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { wishlistParamSchema } from '../schemas/wishlist';
import { authenticate } from '../middleware/auth';
import { NotFoundError, ConflictError } from '../lib/errors';

export const wishlistRouter = Router();

// GET /api/wishlist
wishlistRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user!.userId },
      include: {
        book: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/:bookId
wishlistRouter.post('/:bookId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId } = wishlistParamSchema.parse(req.params);

    const book = await prisma.book.findFirst({ where: { id: bookId, deletedAt: null } });
    if (!book) {
      throw new NotFoundError('Book');
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_bookId: { userId: req.user!.userId, bookId } },
    });
    if (existing) {
      throw new ConflictError('Book is already in your wishlist');
    }

    const item = await prisma.wishlist.create({
      data: { userId: req.user!.userId, bookId },
      include: { book: { include: { category: true } } },
    });

    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:bookId
wishlistRouter.delete('/:bookId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId } = wishlistParamSchema.parse(req.params);

    const existing = await prisma.wishlist.findUnique({
      where: { userId_bookId: { userId: req.user!.userId, bookId } },
    });
    if (!existing) {
      throw new NotFoundError('Wishlist item');
    }

    await prisma.wishlist.delete({
      where: { userId_bookId: { userId: req.user!.userId, bookId } },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
