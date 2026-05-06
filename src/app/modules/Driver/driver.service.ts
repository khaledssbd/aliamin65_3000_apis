import DriverModel from './driver.model';
import { Types } from 'mongoose';
import OrderModel from '../Order/order.model';
import { ORDER_STATUS } from '../../constants';

// 1. upsertDriverProfileIntoDB
const upsertDriverProfileIntoDB = async (
  userId: Types.ObjectId,
  payload: Record<string, unknown>,
) => {
  const doc = await DriverModel.findOneAndUpdate({ user: userId }, payload, {
    upsert: true,
    returnDocument: 'after',
    setDefaultsOnInsert: true,
  });

  return doc;
};

// 2. setDriverAvailabilityIntoDB
const setDriverAvailabilityIntoDB = async (
  userId: Types.ObjectId,
  isAvailable: boolean,
) => {
  const doc = await DriverModel.findOneAndUpdate(
    { user: userId },
    { $set: { isAvailable } },
    { returnDocument: 'after' },
  );
  return doc;
};

// 3. getDriverProfileFromDB
const getDriverProfileFromDB = async (userId: Types.ObjectId) => {
  return DriverModel.findOne({ user: userId });
};

// 4. getAvailableJobsForDriverFromDB
const getAvailableJobsForDriverFromDB = async (userId: Types.ObjectId) => {
  void userId;
  return OrderModel.find({
    status: ORDER_STATUS.REQUESTED,
    driver: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .limit(50);
};

// 5. acceptJobByDriverIntoDB
const acceptJobByDriverIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
) => {
  const driver = await DriverModel.findOne({ user: userId });
  if (!driver) return null;

  const doc = await OrderModel.findOneAndUpdate(
    {
      _id: orderId,
      status: ORDER_STATUS.REQUESTED,
      driver: { $exists: false },
    },
    {
      $set: {
        // Order.driver references User, not Driver
        driver: userId,
        status: ORDER_STATUS.DRIVER_ASSIGNED,
        'timeline.driverAssignedAt': new Date(),
      },
      $unset: { pendingDriver: 1 },
    },
    { returnDocument: 'after' },
  );
  return doc;
};

// 6. declineJobByDriverIntoDB
const declineJobByDriverIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
) => {
  // In a real scenario, we might track which drivers declined which jobs to avoid re-offering
  // For now, we'll just return success to indicate the driver's intent was handled
  return { userId, orderId, declined: true, declinedAt: new Date() };
};

// 7. cancelJobByDriverIntoDB
const cancelJobByDriverIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
  reason?: string,
) => {
  const driver = await DriverModel.findOne({ user: userId });
  if (!driver) return null;

  const doc = await OrderModel.findOneAndUpdate(
    // Order.driver references User, not Driver
    { _id: orderId, driver: userId },
    {
      $set: { driver: null, status: ORDER_STATUS.REQUESTED },
      $push: { 'timeline.canceledAt': new Date() },
    },
    { returnDocument: 'after' },
  );
  return { order: doc, reason };
};

export const DriverService = {
  upsertDriverProfileIntoDB,
  setDriverAvailabilityIntoDB,
  getDriverProfileFromDB,
  getAvailableJobsForDriverFromDB,
  acceptJobByDriverIntoDB,
  declineJobByDriverIntoDB,
  cancelJobByDriverIntoDB,
};
