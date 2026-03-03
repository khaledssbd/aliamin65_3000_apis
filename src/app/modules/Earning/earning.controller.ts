import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { EarningService } from './earning.service';

// 1. getMyEarnings
const getMyEarnings = asyncHandler(async (req, res) => {
  const docs = await EarningService.getMyEarningsFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Earnings fetched successfully!',
    data: docs,
  });
});

// 2. getMyEarningByOrderId
const getMyEarningByOrderId = asyncHandler(async (req, res) => {
  const doc = await EarningService.getMyEarningByOrderIdFromDB(
    req.user._id,
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Earning fetched successfully!',
    data: doc,
  });
});

// 3. getMyEarningsSummaryForToday
const getMyEarningsSummaryForToday = asyncHandler(async (req, res) => {
  const summary = await EarningService.getMyEarningsSummaryForTodayFromDB(
    req.user._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Today summary fetched successfully!',
    data: summary,
  });
});

export const EarningController = {
  getMyEarnings,
  getMyEarningByOrderId,
  getMyEarningsSummaryForToday,
};
