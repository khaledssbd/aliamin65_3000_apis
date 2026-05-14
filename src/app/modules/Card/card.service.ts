import CardModel from './card.model';
import { Types } from 'mongoose';
import type { TCardAttachPayload } from './card.validation';
import Stripe from 'stripe';
import config from '../../config';
import UserModel from '../User/user.model';
import { AppError } from '../../utils';
import httpStatus from 'http-status';

const stripe = config.stripe_secret_key
  ? new Stripe(config.stripe_secret_key, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null;

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
  if (!stripe) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe is not configured',
    );
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const existingDefault = await CardModel.findOne({
    user: userId,
    isDefault: true,
  });
  const stripeCustomerId =
    payload.stripeCustomerId ??
    (existingDefault ? existingDefault.stripeCustomerId : undefined) ??
    (
      await stripe.customers.create({
        email: user.email,
        name: user.name,
        phone: user.phone,
        metadata: { userId: String(userId) },
      })
    ).id;

  const paymentMethod = await stripe.paymentMethods.attach(
    payload.paymentMethodId,
    { customer: stripeCustomerId },
  );

  await stripe.customers.update(stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethod.id,
    },
  });

  const card = paymentMethod.card;
  const doc = await CardModel.create({
    user: userId,
    stripeCustomerId,
    stripePaymentMethodId: paymentMethod.id,
    brand: payload.brand ?? (card ? card.brand : undefined),
    last4: payload.last4 ?? (card ? card.last4 : undefined),
    expMonth: payload.expMonth ?? (card ? card.exp_month : undefined),
    expYear: payload.expYear ?? (card ? card.exp_year : undefined),
    isDefault: payload.isDefault ?? !existingDefault,
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
