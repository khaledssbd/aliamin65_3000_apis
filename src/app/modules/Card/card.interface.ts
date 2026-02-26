import { Document, Types } from 'mongoose';

export interface ICard extends Document {
  user: Types.ObjectId;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
