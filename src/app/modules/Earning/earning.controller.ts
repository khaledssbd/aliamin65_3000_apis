import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { EarningService } from './earning.service';

// 1. listMyEarnings
const listMyEarnings = asyncHandler(async (req, res) => {
  const docs = await EarningService.listMyEarningsFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Earnings',
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
    message: 'Earning',
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
    message: 'Today summary',
    data: summary,
  });
});

export const EarningController = {
  listMyEarnings,
  getMyEarningByOrderId,
  getMyEarningsSummaryForToday,
};
