import { z } from 'zod';

// createOrUpdatePricingSchema
const createOrUpdatePricingSchema = z.object({
  body: z.object({
    pricePerBag: z.number().positive(),
    // currency: z.string().default('USD').optional(),
    minBags: z.number().min(1).default(1).optional(),
    driverEarningPercentage: z.number().positive(),
  }),
});

export const PricingValidation = {
  createOrUpdatePricingSchema,
};
