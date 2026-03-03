import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { EarningService } from './earning.service';

// 1. getEarnings
const getEarnings = asyncHandler(async (req, res) => {
  const docs = await EarningService.getEarningsFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Earnings retrieved',
    data: docs,
  });
});

// 2. getEarning
const getEarning = asyncHandler(async (req, res) => {
  const doc = await EarningService.getEarningFromDB(
    req.user._id,
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Earning retrieved',
    data: doc,
  });
});

// 3. getTodayEarningsSummary
const getTodayEarningsSummary = asyncHandler(async (req, res) => {
  const summary = await EarningService.getTodayEarningsSummaryFromDB(
    req.user._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Today earnings summary retrieved',
    data: summary,
  });
});

export const EarningController = {
  getEarnings,
  getEarning,
  getTodayEarningsSummary,
};
