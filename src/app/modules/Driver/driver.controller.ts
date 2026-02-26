import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DriverService } from './driver.service';
import { getIO } from '../../socket';

const onboarding = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertMine(req.user._id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Onboarding saved',
    data: result,
  });
});

const insurance = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertMine(req.user._id, {
    insurance: req.body,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Insurance updated',
    data: result,
  });
});

const vehicle = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertMine(req.user._id, {
    vehicle: req.body,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vehicle updated',
    data: result,
  });
});

const me = asyncHandler(async (req, res) => {
  const result = await DriverService.me(req.user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile',
    data: result,
  });
});

const availability = asyncHandler(async (req, res) => {
  const result = await DriverService.setAvailability(
    req.user._id,
    req.body.isAvailable,
  );
  getIO()?.emit('driver:availability:updated', {
    isAvailable: req.body.isAvailable,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Availability updated',
    data: result,
  });
});

const jobsAvailable = asyncHandler(async (req, res) => {
  const result = await DriverService.jobsAvailable(req.user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Jobs available',
    data: result,
  });
});

const acceptJob = asyncHandler(async (req, res) => {
  const result = await DriverService.acceptJob(
    req.user._id,
    req.params.orderId as string,
  );
  getIO()?.emit('driver:job:locked', { orderId: req.params.orderId });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job accepted',
    data: result,
  });
});

const declineJob = asyncHandler(async (req, res) => {
  const result = await DriverService.declineJob(
    req.user._id,
    req.params.orderId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job declined',
    data: result,
  });
});

const cancelJob = asyncHandler(async (req, res) => {
  const result = await DriverService.cancelJob(
    req.user._id,
    req.params.orderId as string,
    req.body?.reason,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job canceled',
    data: result,
  });
});

export const DriverController = {
  onboarding,
  insurance,
  vehicle,
  me,
  availability,
  jobsAvailable,
  acceptJob,
  declineJob,
  cancelJob,
};
