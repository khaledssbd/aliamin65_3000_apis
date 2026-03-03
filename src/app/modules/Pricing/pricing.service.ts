import PricingModel from './pricing.model';

const getActivePricingFromDB = async () => {
  const doc = await PricingModel.findOne({ active: true }).sort({
    createdAt: -1,
  });
  return doc;
};

const createPricingIntoDB = async (payload: {
  perBagPrice: number;
  currency?: string;
  minBags?: number;
  active?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}) => {
  const doc = await PricingModel.create(payload);
  return doc;
};

const activatePricingIntoDB = async (id: string) => {
  await PricingModel.updateMany({}, { $set: { active: false } });
  const doc = await PricingModel.findByIdAndUpdate(
    id,
    { $set: { active: true } },
    { new: true },
  );
  return doc;
};

export const PricingService = {
  getActivePricingFromDB,
  createPricingIntoDB,
  activatePricingIntoDB,
};
