import { z } from 'zod';

// 1. createAddressValidationSchema
const createAddressValidationSchema = z.object({
  body: z.object({
    address: z.string({ error: 'Address is required' }).min(1),
  }),
});

// 2. updateAddressValidationSchema
const updateAddressValidationSchema = z.object({
  body: z.object({
    address: z.string({ error: 'Address is required' }).min(1),
  }),
});

export const AddressValidation = {
  createAddressValidationSchema,
  updateAddressValidationSchema,
};
