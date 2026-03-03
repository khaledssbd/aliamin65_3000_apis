import PaymentModel from './payment.model';
import { Types } from 'mongoose';

// 1. createIntentInDB
const createIntentInDB = async (
  userId: Types.ObjectId,
  orderId: string,
  amount?: number,
) => {
  const doc = await PaymentModel.create({
    order: orderId,
    customer: userId,
    amount: amount ?? 0,
    currency: 'USD',
    status: 'requires_confirmation',
  });
  return { doc, clientSecret: `pi_${doc._id}_secret` };
};

// 2. confirmInDB
const confirmInDB = async (userId: Types.ObjectId, orderId: string) => {
  return PaymentModel.findOneAndUpdate(
    { order: orderId, customer: userId },
    { $set: { status: 'succeeded', capturedAt: new Date() } },
    { new: true },
  );
};

// 3. byOrderInDB
const byOrderInDB = async (orderId: string) => {
  return PaymentModel.findOne({ order: orderId });
};

export const PaymentService = {
  createIntentInDB,
  confirmInDB,
  byOrderInDB,
};
