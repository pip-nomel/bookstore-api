import { z } from 'zod';

export const wishlistParamSchema = z.object({
  bookId: z.coerce.number().int().positive(),
});
