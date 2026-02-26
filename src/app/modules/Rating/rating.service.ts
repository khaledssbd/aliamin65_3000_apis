import { Types } from 'mongoose';
import RatingModel from './rating.model';
import { IRating } from './rating.interface';

const createRating = async (payload: Partial<IRating>) => {
  const result = await RatingModel.create(payload);
  return result;
};

const getDriverRatings = async (driverId: string) => {
  const pipeline = [
    { $match: { driver: new Types.ObjectId(driverId) } },
    {
      $group: {
        _id: '$driver',
        count: { $sum: 1 },
        avg: { $avg: '$rating' },
      },
    },
  ];

  const summary = await RatingModel.aggregate(pipeline);
  const list = await RatingModel.find({ driver: driverId })
    .sort({ createdAt: -1 })
    .limit(50);

  return {
    summary: summary[0] ?? { _id: driverId, count: 0, avg: 0 },
    list,
  };
};

export const RatingService = {
  createRating,
  getDriverRatings,
};
