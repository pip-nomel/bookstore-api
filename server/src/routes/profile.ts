import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { updateProfileSchema } from '../schemas/profile';
import { authenticate } from '../middleware/auth';
import { NotFoundError, ValidationError } from '../lib/errors';

export const profileRouter = Router();

// GET /api/profile
profileRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile
profileRouter.put('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      throw new NotFoundError('User');
    }

    const validPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!validPassword) {
      throw new ValidationError('Current password is incorrect');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});
