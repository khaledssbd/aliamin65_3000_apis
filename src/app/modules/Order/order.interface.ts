import { Document, Types } from 'mongoose';

export type TOrderStatus =
  | 'REQUESTED'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'WASHING_DRYING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELED';

export type TServiceType = 'WASH_DRY' | 'DRY_CLEAN';
export type TPickupType = 'ASAP' | 'SCHEDULED';

export interface IOrder extends Document {
  customer: Types.ObjectId;
  driver?: Types.ObjectId;
  pickupAddress: string;
  deliveryAddress: string;
  serviceType: TServiceType;
  pickupType: TPickupType;
  scheduledPickupAt?: Date;
  bags: number;
  specialInstructions?: string;
  status: TOrderStatus;
  pricePerBag: number;
  tip?: number;
  total: number;
  bagCountAtPickup?: number;
  bagCountAtDelivery?: number;
  timeline?: {
    requestedAt?: Date;
    driverAssignedAt?: Date;
    pickedUpAt?: Date;
    washingDryingAt?: Date;
    outForDeliveryAt?: Date;
    deliveredAt?: Date;
    completedAt?: Date;
    canceledAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
