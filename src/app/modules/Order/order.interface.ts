import { Document, Types } from 'mongoose';
import { ORDER_STATUS_VALUES } from '../../constants';

export type TOrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export type TServiceType = 'WASH_DRY' | 'DRY_CLEAN';
export type TPickupType = 'ASAP' | 'SCHEDULED';

export interface IOrder extends Document {
  customer: Types.ObjectId;
  driver?: Types.ObjectId;
  address: string;
  pickupLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  expectedRadiusKm?: number;
  serviceType: TServiceType;
  pickupType: TPickupType;
  scheduledPickupAt?: Date;
  bags: number;
  specialInstructions?: string;
  status: TOrderStatus;
  pricePerBag: number;
  driverEarningPercentage: number;
  // tip?: number;
  total: number;
  bagCountAtPickup?: number;
  bagCountAtDelivery?: number;
  timeline?: {
    requestedAt?: Date;
    driverAssignedAt?: Date;
    pickedUpAt?: Date;
    washingDryingAt?: Date;
    dryingAt?: Date;
    foldingAt?: Date;
    outForDeliveryAt?: Date;
    deliveredAt?: Date;
    completedAt?: Date;
    canceledAt?: Date;
  };
  canceledBy?: Types.ObjectId;
  canceledByRole?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
