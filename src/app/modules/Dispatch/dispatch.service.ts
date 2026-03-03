import DispatchModel from './dispatch.model';
import { Types } from 'mongoose';

// 1. createDispatchBatchInDB
const createDispatchBatchInDB = async (payload: {
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

// 2. reassignDispatchBatchDriverInDB
const reassignDispatchBatchDriverInDB = async (
  id: string,
  driverId: string,
) => {
  return DispatchModel.findByIdAndUpdate(
    id,
    { $set: { driver: driverId } },
    { new: true },
  );
};

// 3. updateDispatchBatchSequenceInDB
const updateDispatchBatchSequenceInDB = async (
  id: string,
  sequence: string[],
) => {
  return DispatchModel.findByIdAndUpdate(
    id,
    { $set: { sequence } },
    { new: true },
  );
};

// 4. updateDispatchBatchStatusInDB
const updateDispatchBatchStatusInDB = async (id: string, status: string) => {
  return DispatchModel.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );
};

// 5. listMyAssignedDispatchBatchesInDB
const listMyAssignedDispatchBatchesInDB = async (
  driverUserId: Types.ObjectId,
) => {
  return DispatchModel.find({ driver: driverUserId })
    .sort({ createdAt: -1 })
    .limit(5);
};

// 6. getDispatchBatchByIdFromDB
const getDispatchBatchByIdFromDB = async (id: string) => {
  return DispatchModel.findById(id).populate('orders');
};

export const DispatchService = {
  createDispatchBatchInDB,
  reassignDispatchBatchDriverInDB,
  updateDispatchBatchSequenceInDB,
  updateDispatchBatchStatusInDB,
  listMyAssignedDispatchBatchesInDB,
  getDispatchBatchByIdFromDB,
};
