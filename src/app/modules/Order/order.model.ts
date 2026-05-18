import { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';
import { ORDER_STATUS, ORDER_STATUS_VALUES } from '../../constants';

const orderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    driver: { type: Schema.Types.ObjectId, ref: 'User' },
    serviceType: {
      type: String,
      enum: ['WASH_DRY', 'DRY_CLEAN'],
      default: 'WASH_DRY',
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    expectedRadiusKm: { type: Number, min: 0.1, max: 200 },
    bags: { type: Number, required: true, min: 1 },
    pickupType: { type: String, enum: ['ASAP', 'SCHEDULED'], default: 'ASAP' },
    scheduledPickupAt: { type: Date },
    specialInstructions: { type: String },
    address: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.REQUESTED,
      index: true,
    },
    pricePerBag: { type: Number, required: true },
    driverEarningPercentage: { type: Number, required: true, default: 70 },
    // tip: { type: Number, default: 0 },
    total: { type: Number, required: true },
    bagCountAtPickup: { type: Number },
    bagCountAtDelivery: { type: Number },
    timeline: {
      requestedAt: { type: Date },
      driverAssignedAt: { type: Date },
      pickedUpAt: { type: Date },
      washingDryingAt: { type: Date },
      dryingAt: { type: Date },
      foldingAt: { type: Date },
      outForDeliveryAt: { type: Date },
      deliveredAt: { type: Date },
      completedAt: { type: Date },
      canceledAt: { type: Date },
    },
  },
  { timestamps: true, versionKey: false },
);

orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ pickupLocation: '2dsphere' });

const OrderModel = model<IOrder>('Order', orderSchema);
export default OrderModel;
