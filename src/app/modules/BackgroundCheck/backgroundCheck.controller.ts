import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { BackgroundCheckService } from './backgroundCheck.service';

const start = asyncHandler(async (req, res) => {
  const doc = await BackgroundCheckService.start({
    driverId: req.body.driverId,
    provider: req.body.provider,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background check started',
    data: doc,
  });
});

const byDriver = asyncHandler(async (req, res) => {
  const doc = await BackgroundCheckService.byDriver(
    String(req.params.driverId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background status',
    data: doc,
  });
});

const getById = asyncHandler(async (req, res) => {
  const doc = await BackgroundCheckService.getById(String(req.params.id));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background detail',
    data: doc,
  });
});

export const BackgroundCheckController = {
  start,
  byDriver,
  getById,
};
