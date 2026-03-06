import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { BackgroundCheckService } from './backgroundCheck.service';

// checkDriverBackgroundStatus
const checkDriverBackgroundStatus = asyncHandler(async (req, res) => {
  const doc = await BackgroundCheckService.checkDriverBackgroundStatusIntoDB(
    String(req.params.id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background check status synced successfully!',
    data: doc,
  });
});

// createBackgroundCheckForDriver
const createBackgroundCheckForDriver = asyncHandler(async (req, res) => {
  const doc = await BackgroundCheckService.createBackgroundCheckForDriverInDB(
    String(req.params.driverId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background check created successfully!',
    data: doc,
  });
});

// syncDriverBackgroundStatusByDriverId
const syncDriverBackgroundStatusByDriverId = asyncHandler(async (req, res) => {
  const doc =
    await BackgroundCheckService.syncDriverBackgroundStatusByDriverIdIntoDB(
      String(req.params.driverId),
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background check status synced successfully!',
    data: doc,
  });
});

// getDriverBackgroundDataByHisDriverId
const getDriverBackgroundDataByHisDriverId = asyncHandler(async (req, res) => {
  const doc =
    await BackgroundCheckService.getDriverBackgroundDataByHisDriverIdFromDB(
      String(req.params.driverId),
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background status fetched successfully!',
    data: doc,
  });
});

// getDriverBackgroundDataByHisUserId
const getDriverBackgroundDataByHisUserId = asyncHandler(async (req, res) => {
  const doc =
    await BackgroundCheckService.getDriverBackgroundDataByHisUserIdFromDB(
      String(req.params.id),
    );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background details fetched successfully!',
    data: doc,
  });
});

export const BackgroundCheckController = {
  checkDriverBackgroundStatus,
  createBackgroundCheckForDriver,
  syncDriverBackgroundStatusByDriverId,
  getDriverBackgroundDataByHisDriverId,
  getDriverBackgroundDataByHisUserId,
};
