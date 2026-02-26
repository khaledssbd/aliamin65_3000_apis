import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { RatingService } from './rating.service';

const create = asyncHandler(async (req, res) => {
  const doc = await RatingService.createRating({
    order: req.body.orderId,
    customer: req.user._id,
    driver: req.body.driverId,
    rating: req.body.rating,
    feedback: req.body.feedback,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Rating submitted',
    data: doc,
  });
});

const byDriver = asyncHandler(async (req, res) => {
  const result = await RatingService.getDriverRatings(
    String(req.params.driverId),
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ratings',
    data: result,
  });
});

export const RatingController = { create, byDriver };
