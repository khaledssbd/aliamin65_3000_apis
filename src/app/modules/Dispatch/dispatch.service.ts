import DispatchModel from './dispatch.model';
import { Types } from 'mongoose';

const create = async (payload: {
  driverId: string;
  orders: string[];
  zoneId?: string;
  timeWindowStart?: string;
  timeWindowEnd?: string;
}) => {
  const doc = await DispatchModel.create({
    driver: payload.driverId,
    orders: payload.orders,
    zone: payload.zoneId,
    timeWindowStart: payload.timeWindowStart
      ? new Date(payload.timeWindowStart)
      : undefined,
    timeWindowEnd: payload.timeWindowEnd
      ? new Date(payload.timeWindowEnd)
      : undefined,
    sequence: payload.orders,
    status: 'ASSIGNED',
  });
  return doc;
};

const assign = async (id: string, driverId: string) => {
  return DispatchModel.findByIdAndUpdate(
    id,
    { $set: { driver: driverId } },
    { new: true },
  );
};

const sequence = async (id: string, sequence: string[]) => {
  return DispatchModel.findByIdAndUpdate(
    id,
    { $set: { sequence } },
    { new: true },
  );
};

const status = async (id: string, status: string) => {
  return DispatchModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );
};

const driverMe = async (driverUserId: Types.ObjectId) => {
  return DispatchModel.find({ driver: driverUserId })
    .sort({ createdAt: -1 })
    .limit(5);
};

const getById = async (id: string) => {
  return DispatchModel.findById(id).populate('orders');
};

export const DispatchService = {
  create,
  assign,
  sequence,
  status,
  driverMe,
  getById,
};
