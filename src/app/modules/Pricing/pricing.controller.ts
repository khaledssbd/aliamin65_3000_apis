import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { PricingService } from './pricing.service';

const getActive = asyncHandler(async (_req, res) => {
  const result = await PricingService.getActive();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Active pricing',
    data: result,
  });
});

const create = asyncHandler(async (req, res) => {
  const result = await PricingService.create(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Pricing created',
    data: result,
  });
});

const activate = asyncHandler(async (req, res) => {
  const result = await PricingService.activate(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pricing activated',
    data: result,
  });
});

export const PricingController = {
  getActive,
  create,
  activate,
};
