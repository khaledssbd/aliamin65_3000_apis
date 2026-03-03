import DriverModel from './driver.model';
import { Types } from 'mongoose';
import OrderModel from '../Order/order.model';
import { ORDER_STATUS } from '../../constants';

const upsertMine = async (
  userId: Types.ObjectId,
  payload: Record<string, unknown>,
) => {
  const doc = await DriverModel.findOneAndUpdate({ user: userId }, payload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  return doc;
};

const setAvailability = async (
  userId: Types.ObjectId,
  isAvailable: boolean,
) => {
  const doc = await DriverModel.findOneAndUpdate(
    { user: userId },
    { $set: { isAvailable } },
    { new: true },
  );
  return doc;
};

const me = async (userId: Types.ObjectId) => {
  return DriverModel.findOne({ user: userId });
};

const jobsAvailable = async (userId: Types.ObjectId) => {
  void userId;
  // Basic filter: unassigned and requested
  // Future: limit by zone/geo
  return OrderModel.find({
    status: ORDER_STATUS.REQUESTED,
    driver: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .limit(50);
};

const acceptJob = async (userId: Types.ObjectId, orderId: string) => {
  const doc = await OrderModel.findOneAndUpdate(
    {
      _id: orderId,
      status: ORDER_STATUS.REQUESTED,
      driver: { $exists: false },
    },
    {
      $set: {
        driver: userId,
        status: ORDER_STATUS.DRIVER_ASSIGNED,
        'timeline.driverAssignedAt': new Date(),
      },
      $unset: { pendingDriver: 1 },
    },
    { new: true },
  );
  return doc;
};

const declineJob = async (_userId: Types.ObjectId, _orderId: string) => {
  void _userId;
  void _orderId;
  // No change to order in MVP
  return { declined: true };
};

const cancelJob = async (
  userId: Types.ObjectId,
  orderId: string,
  reason?: string,
) => {
  const driver = await DriverModel.findOne({ user: userId });
  const doc = await OrderModel.findOneAndUpdate(
    { _id: orderId, driver: driver?._id ?? userId },
    {
      $set: { driver: null, status: ORDER_STATUS.REQUESTED },
      $push: { 'timeline.canceledAt': new Date() },
    },
    { new: true },
  );
  return { order: doc, reason };
};

export const DriverService = {
  upsertMine,
  setAvailability,
  me,
  jobsAvailable,
  acceptJob,
  declineJob,
  cancelJob,
};
