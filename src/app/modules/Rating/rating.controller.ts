import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import RatingModel from './rating.model';
import { Types } from 'mongoose';

const create = asyncHandler(async (req, res) => {
  const doc = await RatingModel.create({
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
  const pipeline = [
    { $match: { driver: new Types.ObjectId(req.params.driverId as string) } },
    {
      $group: {
        _id: '$driver',
        count: { $sum: 1 },
        avg: { $avg: '$rating' },
      },
    },
  ];
  const summary = await RatingModel.aggregate(pipeline);
  const list = await RatingModel.find({ driver: req.params.driverId })
    .sort({ createdAt: -1 })
    .limit(50);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ratings',
    data: { summary: summary[0] ?? {}, list },
  });
});

export const RatingController = { create, byDriver };
