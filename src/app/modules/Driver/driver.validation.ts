import { z } from 'zod';

export const DriverValidation = {
  onboarding: z.object({
    body: z.object({
      licenseImageUrl: z.string().optional(),
      selfieImageUrl: z.string().optional(),
    }),
  }),
  insurance: z.object({
    body: z.object({
      provider: z.string().optional(),
      policyNumber: z.string().optional(),
      expiration: z.string().datetime().optional(),
      documentImageUrl: z.string().optional(),
    }),
  }),
  vehicle: z.object({
    body: z.object({
      make: z.string().optional(),
      model: z.string().optional(),
      year: z.number().optional(),
      plate: z.string().optional(),
    }),
  }),
  availability: z.object({
    body: z.object({
      isAvailable: z.boolean(),
    }),
  }),
  idParam: z.object({ params: z.object({ id: z.string() }) }),
};
