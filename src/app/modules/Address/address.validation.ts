import { z } from 'zod';

// 1. createSchema
const createSchema = z.object({
  body: z.object({
    address: z.string({ error: 'Address is required' }).min(1),
  }),
});

// 2. updateSchema
const updateSchema = z.object({
  body: z.object({
    address: z.string({ error: 'Address is required' }).min(1),
  }),
});

export const AddressValidation = {
  createSchema,
  updateSchema,
};
