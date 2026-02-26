import { z } from 'zod';

export const CardValidation = {
  attach: z.object({
    body: z.object({
      paymentMethodId: z.string(),
      stripeCustomerId: z.string().optional(),
      brand: z.string().optional(),
      last4: z.string().min(4).max(4).optional(),
      expMonth: z.number().min(1).max(12).optional(),
      expYear: z.number().min(2000).max(2100).optional(),
      isDefault: z.boolean().optional(),
    }),
  }),
  idParam: z.object({
    params: z.object({
      id: z.string(),
    }),
  }),
};

export type TCardAttachPayload = z.infer<typeof CardValidation.attach>['body'];
