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
    message: 'Background check started',
    data: doc,
  });
});

// getDriverBackgroundDataByHisDriverId
const getDriverBackgroundDataByHisDriverId = asyncHandler(async (req, res) => {
  const doc = await BackgroundCheckService.getDriverBackgroundDataByHisDriverIdFromDB(
    String(req.params.driverId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Background status',
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
    message: 'Background detail',
    data: doc,
  });
});

export const BackgroundCheckController = {
  checkDriverBackgroundStatus,
  getDriverBackgroundDataByHisDriverId,
  getDriverBackgroundDataByHisUserId,
};
