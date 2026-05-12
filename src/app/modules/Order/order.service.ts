import OrderModel from './order.model';
import PricingModel from '../Pricing/pricing.model';
import { ORDER_STATUS } from '../../constants';
import { Types } from 'mongoose';
import { IUser } from '../User/user.interface';
import { TPickupType, TServiceType } from './order.interface';

// 0. computeTotal
// const computeTotal = async (bags: number, tip = 0) => {
//   const active = await PricingModel.findOne({ active: true });
//   const pricePerBag = active?.pricePerBag ?? 45;
//   const total = bags * pricePerBag + tip;
//   return { pricePerBag, total };
// };
const computeTotal = async (bags: number) => {
  const active = await PricingModel.findOne({});
  const pricePerBag = active?.pricePerBag ?? 45;
  const total = bags * pricePerBag;
  return { pricePerBag, total };
};

// 1. createOrderIntoDB
const createOrderIntoDB = async (
  customer: IUser,
  payload: {
    serviceType: TServiceType;
    pickupType: TPickupType;
    scheduledPickupAt?: string;
    bags: number;
    specialInstructions?: string;
    pickupLat?: number;
    pickupLng?: number;
    expectedRadiusKm?: number;
  },
) => {
  const { total, pricePerBag } = await computeTotal(payload.bags);

  const pickupLat =
    typeof payload.pickupLat === 'number'
      ? payload.pickupLat
      : payload.pickupLat
        ? Number(payload.pickupLat)
        : undefined;
  const pickupLng =
    typeof payload.pickupLng === 'number'
      ? payload.pickupLng
      : payload.pickupLng
        ? Number(payload.pickupLng)
        : undefined;

  const pickupLocation =
    typeof pickupLat === 'number' &&
    Number.isFinite(pickupLat) &&
    typeof pickupLng === 'number' &&
    Number.isFinite(pickupLng)
      ? { type: 'Point' as const, coordinates: [pickupLng, pickupLat] }
      : undefined;

  const expectedRadiusKm =
    payload.expectedRadiusKm !== undefined && payload.expectedRadiusKm !== null
      ? Math.max(0.1, Number(payload.expectedRadiusKm))
      : undefined;

  const result = await OrderModel.create({
    customer: customer._id,
    scheduledPickupAt: payload.scheduledPickupAt,
    address: customer.address,
    serviceType: payload.serviceType,
    pickupType: payload.pickupType,
    bags: payload.bags,
    specialInstructions: payload.specialInstructions,
    pickupLocation,
    expectedRadiusKm,
    status: ORDER_STATUS.REQUESTED,
    pricePerBag,
    total,
    timeline: { requestedAt: new Date() },
  });

  return result;
};

// 2. getMyOrdersFromDB
const getMyOrdersFromDB = async (customerId: Types.ObjectId) => {
  return OrderModel.find({ customer: customerId }).sort({ createdAt: -1 });
};

// 3. getOrderByIdFromDB
const getOrderByIdFromDB = async (id: string, userId?: Types.ObjectId) => {
  const filter: Record<string, unknown> = { _id: id };

  if (userId) filter.$or = [{ customer: userId }, { driver: userId }];
  return OrderModel.findOne(filter).populate('driver');
};

// 4. assignDriverToOrderIntoDB
const assignDriverToOrderIntoDB = async (id: string, driverId: string) => {
  return OrderModel.findByIdAndUpdate(
    id,
    {
      $set: {
        driver: driverId,
        status: ORDER_STATUS.DRIVER_ASSIGNED,
        'timeline.driverAssignedAt': new Date(),
      },
    },
    { returnDocument: 'after' },
  );
};

// 5. updateOrderStatusIntoDB
const updateOrderStatusIntoDB = async (id: string, status: string) => {
  const patch: Record<string, unknown> = { status };
  const now = new Date();
  if (status === ORDER_STATUS.PICKED_UP) patch['timeline.pickedUpAt'] = now;
  if (status === ORDER_STATUS.WASHING_DRYING)
    patch['timeline.washingDryingAt'] = now;
  if (status === ORDER_STATUS.OUT_FOR_DELIVERY)
    patch['timeline.outForDeliveryAt'] = now;
  if (status === ORDER_STATUS.DELIVERED) patch['timeline.deliveredAt'] = now;
  if (status === ORDER_STATUS.COMPLETED) patch['timeline.completedAt'] = now;
  return OrderModel.findByIdAndUpdate(
    id,
    { $set: patch },
    { returnDocument: 'after' },
  );
};

// 6. updateBagCountIntoDB
const updateBagCountIntoDB = async (
  id: string,
  kind: 'pickup' | 'delivery',
  count: number,
) => {
  const field = kind === 'pickup' ? 'bagCountAtPickup' : 'bagCountAtDelivery';
  return OrderModel.findByIdAndUpdate(
    id,
    { $set: { [field]: count } },
    { returnDocument: 'after' },
  );
};

export const OrderService = {
  computeTotal,
  createOrderIntoDB,
  getMyOrdersFromDB,
  getOrderByIdFromDB,
  assignDriverToOrderIntoDB,
  updateOrderStatusIntoDB,
  updateBagCountIntoDB,
};
