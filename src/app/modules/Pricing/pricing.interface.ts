import { Document } from 'mongoose';

export interface IPricing extends Document {
  pricePerBag: number;
  // currency: string;
  minBags: number;
  driverEarningPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}
