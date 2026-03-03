import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PricingService } from './pricing.service';

// 1. getActivePricing
const getActivePricing = asyncHandler(async (_req, res) => {
  const result = await PricingService.getActivePricingFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Active pricing',
    data: result,
  });
});

// 2. createPricing
const createPricing = asyncHandler(async (req, res) => {
  const result = await PricingService.createPricingIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Pricing created',
    data: result,
  });
});

// 3. activatePricing
const activatePricing = asyncHandler(async (req, res) => {
  const result = await PricingService.activatePricingIntoDB(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pricing activated',
    data: result,
  });
});

export const PricingController = {
  getActivePricing,
  createPricing,
  activatePricing,
};
