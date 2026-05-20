import { z } from 'zod';

export const RatingValidation = {
  createRatingValidationSchema: z.object({
    body: z.object({
      orderId: z.string(),
      driverId: z.string(),
      rating: z.coerce.number().min(1).max(5),
      feedback: z.string().optional(),
    }),
  }),
};
