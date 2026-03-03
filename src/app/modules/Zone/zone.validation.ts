import { z } from 'zod';

const createZoneSchema = z.object({
  body: z.object({
    name: z.string({
      error: 'Name is required',
    }),
    polygon: z
      .object({
        type: z.enum(['Polygon']),
        coordinates: z.array(z.array(z.array(z.number()))),
      })
      .optional(),
    active: z.boolean().optional(),
  }),
});

const updateZoneSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    polygon: z
      .object({
        type: z.enum(['Polygon']),
        coordinates: z.array(z.array(z.array(z.number()))),
      })
      .optional(),
    active: z.boolean().optional(),
  }),
});

export const ZoneValidation = {
  createZoneSchema,
  updateZoneSchema,
};
