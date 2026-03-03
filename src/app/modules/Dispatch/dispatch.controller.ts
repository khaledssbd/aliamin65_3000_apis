import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DispatchService } from './dispatch.service';

// 1. createDispatchBatch
const createDispatchBatch = asyncHandler(async (req, res) => {
  const result = await DispatchService.createDispatchBatchInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Batch created',
    data: result,
  });
});

// 2. reassignDispatchBatchDriver
const reassignDispatchBatchDriver = asyncHandler(async (req, res) => {
  const result = await DispatchService.reassignDispatchBatchDriverInDB(
    String(req.params.id),
    req.body.driverId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Reassigned',
    data: result,
  });
});

// 3. updateDispatchBatchSequence
const updateDispatchBatchSequence = asyncHandler(async (req, res) => {
  const result = await DispatchService.updateDispatchBatchSequenceInDB(
    String(req.params.id),
    req.body.sequence,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Sequence updated',
    data: result,
  });
});

// 4. updateDispatchBatchStatus
const updateDispatchBatchStatus = asyncHandler(async (req, res) => {
  const result = await DispatchService.updateDispatchBatchStatusInDB(
    String(req.params.id),
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Status updated',
    data: result,
  });
});

// 5. listMyAssignedDispatchBatches
const listMyAssignedDispatchBatches = asyncHandler(async (req, res) => {
  const result = await DispatchService.listMyAssignedDispatchBatchesInDB(
    req.user._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'My routes',
    data: result,
  });
});

// 6. getDispatchBatchById
const getDispatchBatchById = asyncHandler(async (req, res) => {
  const result = await DispatchService.getDispatchBatchByIdFromDB(
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Batch detail',
    data: result,
  });
});

export const DispatchController = {
  createDispatchBatch,
  reassignDispatchBatchDriver,
  updateDispatchBatchSequence,
  updateDispatchBatchStatus,
  listMyAssignedDispatchBatches,
  getDispatchBatchById,
};
