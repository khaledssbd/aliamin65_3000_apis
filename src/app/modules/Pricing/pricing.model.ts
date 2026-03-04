import { Schema, model } from 'mongoose';
import { IPricing } from './pricing.interface';

const pricingSchema = new Schema<IPricing>(
  {
    pricePerBag: { type: Number, required: true },
    // currency: { type: String, default: 'USD' },
    minBags: { type: Number, default: 1 },
    driverEarningPercentage: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

const PricingModel = model<IPricing>('Pricing', pricingSchema);
export default PricingModel;
