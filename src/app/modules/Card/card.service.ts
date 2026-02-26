import CardModel from './card.model';
import { Types } from 'mongoose';
import type { TCardAttachPayload } from './card.validation';

const listMine = async (userId: Types.ObjectId) => {
  return CardModel.find({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

const attach = async (userId: Types.ObjectId, payload: TCardAttachPayload) => {
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

const setDefault = async (userId: Types.ObjectId, id: string) => {
  const doc = await CardModel.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { isDefault: true } },
    { new: true },
  );
  await CardModel.updateMany(
    { user: userId, _id: { $ne: id } },
    { $set: { isDefault: false } },
  );
  return doc;
};

const detach = async (userId: Types.ObjectId, id: string) => {
  return CardModel.findOneAndDelete({ _id: id, user: userId });
};

export const CardService = { listMine, attach, setDefault, detach };
