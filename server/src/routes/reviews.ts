import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createReviewSchema } from '../schemas/review';
import { authenticate } from '../middleware/auth';
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from '../lib/errors';

export const reviewsRouter = Router();

// DELETE /api/reviews/:id
reviewsRouter.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new NotFoundError('Review');
    }

    if (req.user!.role !== 'ADMIN' && review.userId !== req.user!.userId) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    await prisma.review.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
