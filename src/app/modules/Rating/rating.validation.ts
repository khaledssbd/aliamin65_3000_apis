import { z } from 'zod';

export const RatingValidation = {
  create: z.object({
    body: z.object({
      orderId: z.string(),
      driverId: z.string(),
      rating: z.number().min(1).max(5),
      feedback: z.string().optional(),
    }),
  }),
};
