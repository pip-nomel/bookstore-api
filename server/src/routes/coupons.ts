import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { validateCouponSchema, createCouponSchema } from '../schemas/coupon';
import { authenticate, requireAdmin } from '../middleware/auth';
import { NotFoundError, ValidationError } from '../lib/errors';

export const couponsRouter = Router();

// POST /api/coupons/validate
couponsRouter.post('/validate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderTotal } = validateCouponSchema.parse(req.body);

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.active) {
      throw new NotFoundError('Coupon');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new ValidationError('Coupon has expired');
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      throw new ValidationError('Coupon usage limit reached');
    }

    if (orderTotal < coupon.minOrder) {
      throw new ValidationError(`Minimum order amount is $${coupon.minOrder}`);
    }

    let discount: number;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round(orderTotal * (coupon.value / 100) * 100) / 100;
    } else {
      discount = Math.min(coupon.value, orderTotal);
    }

    res.json({
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalTotal: Math.round((orderTotal - discount) * 100) / 100,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/coupons (admin only)
couponsRouter.get('/', authenticate, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ data: coupons });
  } catch (err) {
    next(err);
  }
});

// POST /api/coupons (admin only)
couponsRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCouponSchema.parse(req.body);

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });

    res.status(201).json({ data: coupon });
  } catch (err) {
    next(err);
  }
});
