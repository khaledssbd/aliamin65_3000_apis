import EarningModel from './earning.model';
import { Types } from 'mongoose';

const driverMe = async (driverId: Types.ObjectId) => {
  return EarningModel.find({ driver: driverId }).sort({ createdAt: -1 });
};

const driverByOrder = async (driverId: Types.ObjectId, orderId: string) => {
  return EarningModel.findOne({ driver: driverId, order: orderId });
};

const driverSummaryToday = async (driverId: Types.ObjectId) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const agg = await EarningModel.aggregate([
    {
      $match: {
        driver: new Types.ObjectId(String(driverId)),
        createdAt: { $gte: start },
      },
    },
    {
      $group: {
        _id: null,
        deliveries: { $sum: 1 },
        driverAmount: { $sum: '$amountDriver' },
        platformAmount: { $sum: '$amountPlatform' },
        gross: { $sum: '$amountGross' },
      },
    },
  ]);
  return agg[0] ?? {};
};

export const EarningService = {
  driverMe,
  driverByOrder,
  driverSummaryToday,
};
