import { Schema, model } from 'mongoose';
import { IDispatch } from './dispatch.interface';

const dispatchSchema = new Schema<IDispatch>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true,
    },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order', required: true }],
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    timeWindowStart: { type: Date },
    timeWindowEnd: { type: Date },
    sequence: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    status: {
      type: String,
      enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'],
      default: 'ASSIGNED',
    },
  },
  { timestamps: true, versionKey: false },
);

const DispatchModel = model<IDispatch>('Dispatch', dispatchSchema);
export default DispatchModel;
