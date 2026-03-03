import { z } from 'zod';

// createPricingSchema
const createPricingSchema = z.object({
  body: z.object({
    perBagPrice: z.number().positive(),
    currency: z.string().default('USD').optional(),
    minBags: z.number().min(1).default(1).optional(),
    active: z.boolean().optional(),
    effectiveFrom: z.string().datetime().optional(),
    effectiveTo: z.string().datetime().optional(),
  }),
});

export const PricingValidation = {
  createPricingSchema,
};
