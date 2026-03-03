import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { RatingService } from './rating.service';

// 1. createRating
const createRating = asyncHandler(async (req, res) => {
  const doc = await RatingService.createRatingIntoDB({
    order: req.body.orderId,
    customer: req.user._id,
    driver: req.body.driverId,
    rating: req.body.rating,
    feedback: req.body.feedback,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Rating submitted successfully',
    data: doc,
  });
});

// 2. getDriverRatings
const getDriverRatings = asyncHandler(async (req, res) => {
  const result = await RatingService.getDriverRatingsFromDB(
    String(req.params.driverId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver ratings retrieved successfully',
    data: result,
  });
});

export const RatingController = {
  createRating,
  getDriverRatings,
};
