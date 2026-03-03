import DriverModel from './driver.model';
import { Types } from 'mongoose';
import OrderModel from '../Order/order.model';
import { ORDER_STATUS } from '../../constants';

// 1. upsertMineInDB
const upsertMineInDB = async (
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

// 2. setAvailabilityInDB
const setAvailabilityInDB = async (
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

// 3. meInDB
const meInDB = async (userId: Types.ObjectId) => {
  return DriverModel.findOne({ user: userId });
};

// 4. jobsAvailableInDB
const jobsAvailableInDB = async (userId: Types.ObjectId) => {
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

// 5. acceptJobInDB
const acceptJobInDB = async (userId: Types.ObjectId, orderId: string) => {
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

// 6. declineJobInDB
const declineJobInDB = async (_userId: Types.ObjectId, _orderId: string) => {
  void _userId;
  void _orderId;
  // No change to order in MVP
  return { declined: true };
};

// 7. cancelJobInDB
const cancelJobInDB = async (
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
  upsertMineInDB,
  setAvailabilityInDB,
  meInDB,
  jobsAvailableInDB,
  acceptJobInDB,
  declineJobInDB,
  cancelJobInDB,
};
