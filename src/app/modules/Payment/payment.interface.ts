import { Document, Types } from 'mongoose';

export type TPaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'canceled'
  | 'requires_action';

export interface IPayment extends Document {
  order: Types.ObjectId;
  customer: Types.ObjectId;
  amount: number;
  // currency: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  status: TPaymentStatus;
  capturedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
