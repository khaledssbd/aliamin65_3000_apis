import { z } from 'zod';

// 1. attachSchema
const attachSchema = z.object({
  body: z.object({
    paymentMethodId: z.string(),
    stripeCustomerId: z.string().optional(),
    brand: z.string().optional(),
    last4: z.string().min(4).max(4).optional(),
    expMonth: z.number().min(1).max(12).optional(),
    expYear: z.number().min(2000).max(2100).optional(),
    isDefault: z.boolean().optional(),
  }),
});

// 2. idParamSchema
const idParamSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const CardValidation = {
   attachSchema,
  idParamSchema,
};

export type TCardAttachPayload = z.infer<typeof attachSchema>['body'];
