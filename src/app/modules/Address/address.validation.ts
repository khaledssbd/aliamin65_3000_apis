import { z } from 'zod';

export const AddressValidation = {
  create: z.object({
    body: z.object({
      label: z.string().optional(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      location: z
        .object({
          type: z.literal('Point'),
          coordinates: z.tuple([z.number(), z.number()]),
        })
        .optional(),
      isDefault: z.boolean().optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      label: z.string().optional(),
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      location: z
        .object({
          type: z.literal('Point'),
          coordinates: z.tuple([z.number(), z.number()]),
        })
        .optional(),
      isDefault: z.boolean().optional(),
    }),
  }),
};
