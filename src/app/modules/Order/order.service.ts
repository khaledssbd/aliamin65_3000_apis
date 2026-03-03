import OrderModel from './order.model';
import PricingModel from '../Pricing/pricing.model';
import { ORDER_STATUS } from '../../constants';
import { Types } from 'mongoose';

// 0. computeTotal
const computeTotal = async (bags: number, tip = 0) => {
  const active = await PricingModel.findOne({ active: true });
  const price = active?.perBagPrice ?? 45;
  const total = bags * price + tip;
  return { pricePerBag: price, total };
};

// 1. createOrderIntoDB
const createOrderIntoDB = async (
  customerId: Types.ObjectId,
  payload: {
    pickupAddress: string;
    deliveryAddress: string;
    serviceType: string;
    pickupType: string;
    scheduledPickupAt?: string;
    bags: number;
    specialInstructions?: string;
  },
) => {
  const { total, pricePerBag } = await computeTotal(payload.bags);
  const doc = await OrderModel.create({
    customer: customerId,
    pickupAddress: payload.pickupAddress,
    deliveryAddress: payload.deliveryAddress,
    serviceType: payload.serviceType,
    pickupType: payload.pickupType,
    scheduledPickupAt: payload.scheduledPickupAt,
    bags: payload.bags,
    specialInstructions: payload.specialInstructions,
    status: ORDER_STATUS.REQUESTED,
    pricePerBag,
    total,
    timeline: { requestedAt: new Date() },
  });
  return doc;
};

// 2. listMyOrdersFromDB
const listMyOrdersFromDB = async (customerId: Types.ObjectId) => {
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
    { new: true },
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
  return OrderModel.findByIdAndUpdate(id, { $set: patch }, { new: true });
};

// 6. setOrderBagCountIntoDB
const setOrderBagCountIntoDB = async (
  id: string,
  kind: 'pickup' | 'delivery',
  count: number,
) => {
  const field = kind === 'pickup' ? 'bagCountAtPickup' : 'bagCountAtDelivery';
  return OrderModel.findByIdAndUpdate(
    id,
    { $set: { [field]: count } },
    { new: true },
  );
};

// 7. setOrderReadyTimeIntoDB
const setOrderReadyTimeIntoDB = async (id: string, isoTime: string) => {
  return OrderModel.findByIdAndUpdate(
    id,
    { $set: { 'timeline.washingDryingAt': new Date(isoTime) } },
    { new: true },
  );
};

export const OrderService = {
  createOrderIntoDB,
  listMyOrdersFromDB,
  getOrderByIdFromDB,
  assignDriverToOrderIntoDB,
  updateOrderStatusIntoDB,
  setOrderBagCountIntoDB,
  setOrderReadyTimeIntoDB,
};
