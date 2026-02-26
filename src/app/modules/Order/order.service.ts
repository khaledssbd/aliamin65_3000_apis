import OrderModel from './order.model';
import PricingModel from '../Pricing/pricing.model';
import { ORDER_STATUS } from '../../constants';
import { Types } from 'mongoose';

const computeTotal = async (bags: number, tip = 0) => {
  const active = await PricingModel.findOne({ active: true });
  const price = active?.perBagPrice ?? 45;
  const total = bags * price + tip;
  return { pricePerBag: price, total };
};

const create = async (
  customerId: Types.ObjectId,
  payload: {
    pickupAddressId: string;
    deliveryAddressId: string;
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
    pickupAddress: payload.pickupAddressId,
    deliveryAddress: payload.deliveryAddressId,
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

const listMine = async (customerId: Types.ObjectId) => {
  return OrderModel.find({ customer: customerId }).sort({ createdAt: -1 });
};

const getById = async (id: string, userId?: Types.ObjectId) => {
  const filter: any = { _id: id };
  if (userId) filter.$or = [{ customer: userId }, { driver: userId }];
  return OrderModel.findOne(filter)
    .populate('driver')
    .populate('pickupAddress')
    .populate('deliveryAddress');
};

const assignDriver = async (id: string, driverId: string) => {
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

const updateStatus = async (id: string, status: string) => {
  const patch: any = { status };
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

const setBagCount = async (
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

const setReadyTime = async (id: string, isoTime: string) => {
  return OrderModel.findByIdAndUpdate(
    id,
    { $set: { 'timeline.washingDryingAt': new Date(isoTime) } },
    { new: true },
  );
};

export const OrderService = {
  create,
  listMine,
  getById,
  assignDriver,
  updateStatus,
  setBagCount,
  setReadyTime,
};
