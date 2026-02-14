import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createCategorySchema } from '../schemas/category';
import { authenticate, requireAdmin } from '../middleware/auth';

export const categoriesRouter = Router();

// GET /api/categories
categoriesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories (admin only)
categoriesRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
});
