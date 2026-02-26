import { Schema, model } from 'mongoose';
import { IEarning } from './earning.interface';

const earningSchema = new Schema<IEarning>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true,
    },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    amountGross: { type: Number, required: true },
    amountDriver: { type: Number, required: true },
    amountPlatform: { type: Number, required: true },
    payoutStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    payoutAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

const EarningModel = model<IEarning>('Earning', earningSchema);
export default EarningModel;
