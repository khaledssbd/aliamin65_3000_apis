import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PricingService } from './pricing.service';

// 1. getPricing
const getPricing = asyncHandler(async (_req, res) => {
  const result = await PricingService.getPricingFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Active pricing fetched successfully!',
    data: result,
  });
});

// 2. createOrUpdatePricing
const createOrUpdatePricing = asyncHandler(async (req, res) => {
  const result = await PricingService.createOrUpdatePricingInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pricing saved successfully!',
    data: result,
  });
});

export const PricingController = {
  getPricing,
  createOrUpdatePricing,
};
