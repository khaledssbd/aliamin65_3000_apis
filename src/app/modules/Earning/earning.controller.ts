import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { EarningService } from './earning.service';

const driverMe = asyncHandler(async (req, res) => {
  const docs = await EarningService.driverMe(req.user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Earnings',
    data: docs,
  });
});

const driverByOrder = asyncHandler(async (req, res) => {
  const doc = await EarningService.driverByOrder(
    req.user._id,
    String(req.params.orderId),
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Earning',
    data: doc,
  });
});

const driverSummaryToday = asyncHandler(async (req, res) => {
  const summary = await EarningService.driverSummaryToday(req.user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Today summary',
    data: summary,
  });
});

export const EarningController = {
  driverMe,
  driverByOrder,
  driverSummaryToday,
};
