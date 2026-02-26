import { z } from 'zod';

export const PricingValidation = {
  create: z.object({
    body: z.object({
      perBagPrice: z.number().positive(),
      currency: z.string().default('USD').optional(),
      minBags: z.number().min(1).default(1).optional(),
      active: z.boolean().optional(),
      effectiveFrom: z.string().datetime().optional(),
      effectiveTo: z.string().datetime().optional(),
    }),
  }),
};
