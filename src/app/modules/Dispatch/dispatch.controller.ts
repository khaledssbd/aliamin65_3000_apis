import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DispatchService } from './dispatch.service';
import { ROLE } from '../User/user.constant';

// 1. createDispatch
const createDispatch = asyncHandler(async (req, res) => {
  const result = await DispatchService.createDispatchIntoDB(
    req.user._id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Dispatch created successfully!',
    data: result,
  });
});

// 2. reassignDispatch
const reassignDispatch = asyncHandler(async (req, res) => {
  const result = await DispatchService.reassignDispatchIntoDB(
    String(req.params.id),
    req.body.driverId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dispatch reassigned successfully!',
    data: result,
  });
});

// 3. updateDispatchSequence
const updateDispatchSequence = asyncHandler(async (req, res) => {
  const driverUserId = req.user.role === ROLE.DRIVER ? req.user._id : undefined;
  const result = await DispatchService.updateDispatchSequenceIntoDB(
    String(req.params.id),
    req.body.sequence,
    driverUserId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dispatch sequence updated successfully!',
    data: result,
  });
});

// 4. updateDispatchStatus
const updateDispatchStatus = asyncHandler(async (req, res) => {
  const driverUserId = req.user.role === ROLE.DRIVER ? req.user._id : undefined;
  const result = await DispatchService.updateDispatchStatusIntoDB(
    String(req.params.id),
    req.body.status,
    driverUserId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dispatch status updated successfully!',
    data: result,
  });
});

// 5. getDriverDispatches
const getDriverDispatches = asyncHandler(async (req, res) => {
  const result = await DispatchService.getDriverDispatchesFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver dispatches fetched successfully!',
    data: result,
  });
});

// 6. getDispatch
const getDispatch = asyncHandler(async (req, res) => {
  const driverUserId = req.user.role === ROLE.DRIVER ? req.user._id : undefined;
  const result = await DispatchService.getDispatchFromDB(
    String(req.params.id),
    driverUserId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Dispatch fetched successfully!',
    data: result,
  });
});

export const DispatchController = {
  createDispatch,
  reassignDispatch,
  updateDispatchSequence,
  updateDispatchStatus,
  getDriverDispatches,
  getDispatch,
};
