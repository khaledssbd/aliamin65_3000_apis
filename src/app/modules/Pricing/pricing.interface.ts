import { Document } from 'mongoose';

export interface IPricing extends Document {
  perBagPrice: number;
  currency: string;
  minBags: number;
  active: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}
