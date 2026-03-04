import PricingModel from './pricing.model';

// 1. getPricingFromDB
const getPricingFromDB = async () => {
  const doc = await PricingModel.findOne({}).sort({ createdAt: -1 });
  return doc;
};

// 2. createOrUpdatePricingInDB
const createOrUpdatePricingInDB = async (payload: {
  pricePerBag: number;
  // currency: string;
  minBags?: number;
  driverEarningPercentage: number;
}) => {
  const doc = await PricingModel.findOneAndUpdate(
    {},
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  if (doc?._id) {
    await PricingModel.deleteMany({ _id: { $ne: doc._id } });
  }

  return doc;
};

export const PricingService = {
  getPricingFromDB,
  createOrUpdatePricingInDB,
};
