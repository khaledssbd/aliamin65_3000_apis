import DispatchModel from './dispatch.model';
import { Types } from 'mongoose';
import DriverModel from '../Driver/driver.model';
import OrderModel from '../Order/order.model';
import { AppError } from '../../utils';
import httpStatus from 'http-status';

const getDriverProfileOrThrow = async (driverUserId: Types.ObjectId) => {
  const driver = await DriverModel.findOne({ user: driverUserId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Driver profile not found!');
  }
  return driver;
};

const assertOrdersBelongToDriver = async (
  driverUserId: Types.ObjectId,
  orders: string[],
) => {
  const uniqueOrders = [...new Set(orders.map(String))];
  if (!uniqueOrders.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'At least one order is required!',
    );
  }

  const count = await OrderModel.countDocuments({
    _id: { $in: uniqueOrders },
    driver: driverUserId,
  });

  if (count !== uniqueOrders.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can dispatch only your assigned orders!',
    );
  }

  return uniqueOrders;
};

// 1. createDispatchIntoDB
const createDispatchIntoDB = async (
  driverUserId: Types.ObjectId,
  payload: {
    orders: string[];
    zoneId?: string;
    timeWindowStart?: string;
    timeWindowEnd?: string;
  },
) => {
  const driver = await getDriverProfileOrThrow(driverUserId);
  const orders = await assertOrdersBelongToDriver(driverUserId, payload.orders);

  const doc = await DispatchModel.create({
    driver: driver._id,
    orders,
    zone: payload.zoneId,
    timeWindowStart: payload.timeWindowStart
      ? new Date(payload.timeWindowStart)
      : undefined,
    timeWindowEnd: payload.timeWindowEnd
      ? new Date(payload.timeWindowEnd)
      : undefined,
    sequence: orders,
    status: 'ASSIGNED',
  });
  return doc;
};

// 2. reassignDispatchIntoDB
const reassignDispatchIntoDB = async (id: string, driverId: string) => {
  return DispatchModel.findByIdAndUpdate(
    id,
    { $set: { driver: driverId } },
    { returnDocument: 'after' },
  );
};

// 3. updateDispatchSequenceIntoDB
const updateDispatchSequenceIntoDB = async (
  id: string,
  sequence: string[],
  driverUserId?: Types.ObjectId,
) => {
  const filter: Record<string, unknown> = { _id: id };

  if (driverUserId) {
    const driver = await getDriverProfileOrThrow(driverUserId);
    filter.driver = driver._id;

    const dispatch = await DispatchModel.findOne(filter).select('orders');
    if (!dispatch) {
      throw new AppError(httpStatus.NOT_FOUND, 'Dispatch not found!');
    }

    const orderSet = new Set(dispatch.orders.map((orderId) => String(orderId)));
    const sequenceSet = new Set(sequence.map(String));
    const hasInvalidOrder = [...sequenceSet].some(
      (orderId) => !orderSet.has(orderId),
    );

    if (hasInvalidOrder || sequenceSet.size !== orderSet.size) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Sequence must contain all dispatch orders only!',
      );
    }
  }

  return DispatchModel.findOneAndUpdate(
    filter,
    { $set: { sequence } },
    { returnDocument: 'after' },
  );
};

// 4. updateDispatchStatusIntoDB
const updateDispatchStatusIntoDB = async (
  id: string,
  status: string,
  driverUserId?: Types.ObjectId,
) => {
  const filter: Record<string, unknown> = { _id: id };

  if (driverUserId) {
    const driver = await getDriverProfileOrThrow(driverUserId);
    filter.driver = driver._id;
  }

  return DispatchModel.findOneAndUpdate(
    filter,
    { $set: { status } },
    { returnDocument: 'after' },
  );
};

// 5. getDriverDispatchesFromDB
const getDriverDispatchesFromDB = async (driverUserId: Types.ObjectId) => {
  const driver = await getDriverProfileOrThrow(driverUserId);

  return DispatchModel.find({ driver: driver._id })
    .sort({ createdAt: -1 })
    .limit(5);
};

// 6. getDispatchFromDB
const getDispatchFromDB = async (id: string, driverUserId?: Types.ObjectId) => {
  const filter: Record<string, unknown> = { _id: id };

  if (driverUserId) {
    const driver = await getDriverProfileOrThrow(driverUserId);
    filter.driver = driver._id;
  }

  return DispatchModel.findOne(filter).populate('orders');
};

export const DispatchService = {
  createDispatchIntoDB,
  reassignDispatchIntoDB,
  updateDispatchSequenceIntoDB,
  updateDispatchStatusIntoDB,
  getDriverDispatchesFromDB,
  getDispatchFromDB,
};
