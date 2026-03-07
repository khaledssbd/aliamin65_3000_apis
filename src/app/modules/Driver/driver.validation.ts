import { z } from 'zod';

// 1. onboardingSchema
const onboardingSchema = z.object({
  body: z.object({
    licenseImageUrl: z.string().optional(),
    selfieImageUrl: z.string().optional(),
  }),
});

// 2. insuranceSchema
const insuranceSchema = z.object({
  body: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    expiration: z.string().datetime().optional(),
    documentImageUrl: z.string().optional(),
  }),
});

// 3. vehicleSchema
const vehicleSchema = z.object({
  body: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
    plate: z.string().optional(),
  }),
});

// 4. availabilitySchema
const availabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

// 5. idParamSchema
const idParamSchema = z.object({ params: z.object({ id: z.string() }) });

export const DriverValidation = {
  onboardingSchema,
  insuranceSchema,
  vehicleSchema,
  availabilitySchema,
  idParamSchema,
};
