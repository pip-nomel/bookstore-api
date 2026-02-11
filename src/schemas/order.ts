import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      bookId: z.number().int().positive(),
      quantity: z.number().int().positive('Quantity must be at least 1'),
    })
  ).min(1, 'Order must have at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
