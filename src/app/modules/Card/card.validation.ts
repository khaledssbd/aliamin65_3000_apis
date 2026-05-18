import { z } from 'zod';

const expiryYearSchema = z.preprocess((value) => {
  const year = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(year)) return value;

  return year < 100 ? 2000 + year : year;
}, z.number().min(2000).max(2100));

// 1. attachCardValidationSchema
const attachCardValidationSchema = z.object({
  body: z.object({
    paymentMethodId: z.string(),
    stripeCustomerId: z.string().optional(),
    brand: z.string().optional(),
    last4: z.string().min(4).max(4).optional(),
    expMonth: z.number().min(1).max(12).optional(),
    expYear: expiryYearSchema.optional(),
    isDefault: z.boolean().optional(),
  }),
});

// 2. cardIdParamValidationSchema
const cardIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const CardValidation = {
  attachCardValidationSchema,
  cardIdParamValidationSchema,
};

export type TCardAttachPayload = z.infer<
  typeof attachCardValidationSchema
>['body'];
