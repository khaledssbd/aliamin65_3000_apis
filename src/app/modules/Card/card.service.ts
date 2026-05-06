import CardModel from './card.model';
import { Types } from 'mongoose';
import type { TCardAttachPayload } from './card.validation';

// 1. getSavedCardsFromDB
const getSavedCardsFromDB = async (userId: Types.ObjectId) => {
  return CardModel.find({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

// 2. createCardIntoDB
const createCardIntoDB = async (
  userId: Types.ObjectId,
  payload: TCardAttachPayload,
) => {
  const doc = await CardModel.create({
    user: userId,
    stripeCustomerId: payload.stripeCustomerId ?? 'cus_demo',
    stripePaymentMethodId: payload.paymentMethodId,
    brand: payload.brand,
    last4: payload.last4,
    expMonth: payload.expMonth,
    expYear: payload.expYear,
    isDefault: !!payload.isDefault,
  });
  if (doc.isDefault) {
    await CardModel.updateMany(
      { user: userId, _id: { $ne: doc._id } },
      { $set: { isDefault: false } },
    );
  }
  return doc;
};

// 3. setDefaultCardIntoDB
const setDefaultCardIntoDB = async (userId: Types.ObjectId, id: string) => {
  const doc = await CardModel.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { isDefault: true } },
    { returnDocument: 'after' },
  );
  await CardModel.updateMany(
    { user: userId, _id: { $ne: id } },
    { $set: { isDefault: false } },
  );
  return doc;
};

// 4. deleteCardFromDB
const deleteCardFromDB = async (userId: Types.ObjectId, id: string) => {
  return CardModel.findOneAndDelete({ _id: id, user: userId });
};

export const CardService = {
  getSavedCardsFromDB,
  createCardIntoDB,
  setDefaultCardIntoDB,
  deleteCardFromDB,
};
