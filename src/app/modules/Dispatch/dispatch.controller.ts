import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DispatchService } from './dispatch.service';

const create = asyncHandler(async (req, res) => {
  const result = await DispatchService.create(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Batch created',
    data: result,
  });
});

const assign = asyncHandler(async (req, res) => {
  const result = await DispatchService.assign(
    String(req.params.id),
    req.body.driverId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Reassigned',
    data: result,
  });
});

const sequence = asyncHandler(async (req, res) => {
  const result = await DispatchService.sequence(
    String(req.params.id),
    req.body.sequence,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Sequence updated',
    data: result,
  });
});

const status = asyncHandler(async (req, res) => {
  const result = await DispatchService.status(
    String(req.params.id),
    req.body.status,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Status updated',
    data: result,
  });
});

const driverMe = asyncHandler(async (req, res) => {
  const result = await DispatchService.driverMe(req.user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'My routes',
    data: result,
  });
});

const getById = asyncHandler(async (req, res) => {
  const result = await DispatchService.getById(String(req.params.id));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Batch detail',
    data: result,
  });
});

export const DispatchController = {
  create,
  assign,
  sequence,
  status,
  driverMe,
  getById,
};
