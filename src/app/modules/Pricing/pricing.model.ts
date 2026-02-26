import { Schema, model } from 'mongoose';
import { IPricing } from './pricing.interface';

const pricingSchema = new Schema<IPricing>(
  {
    perBagPrice: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    minBags: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

const PricingModel = model<IPricing>('Pricing', pricingSchema);
export default PricingModel;
