import PaymentModel from './payment.model';
import { Types } from 'mongoose';
import OrderModel from '../Order/order.model';
import PricingModel from '../Pricing/pricing.model';
import CardModel from '../Card/card.model';
import DriverModel from '../Driver/driver.model';
import EarningModel from '../Earning/earning.model';
import Stripe from 'stripe';
import config from '../../config';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import { InvoiceService } from '../Invoice/invoice.service';

const stripe = config.stripe_secret_key
  ? new Stripe(config.stripe_secret_key, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null;

// 1. createPaymentIntentForMyOrderIntoDB
const createPaymentIntentForMyOrderIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
  amount?: number,
) => {
  if (!stripe) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe is not configured',
    );
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const activePricing = await PricingModel.findOne({}).sort({ createdAt: -1 });
  const driverPct = activePricing?.driverEarningPercentage ?? 70;
  const totalAmount = amount ?? order.total;

  const card = await CardModel.findOne({
    user: userId,
    isDefault: true,
  });

  if (!card?.stripeCustomerId || !card?.stripePaymentMethodId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Default payment card not found',
    );
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100),
    currency: 'usd',
    customer: card.stripeCustomerId,
    payment_method: card.stripePaymentMethodId,
    confirm: false,
    metadata: {
      orderId: String(order._id),
      customerId: String(userId),
      driverEarningPercentage: String(driverPct),
    },
  });

  const doc = await PaymentModel.create({
    order: order._id,
    customer: userId,
    amount: totalAmount,
    stripePaymentIntentId: intent.id,
    status: 'requires_confirmation',
  });

  return { doc, clientSecret: intent.client_secret };
};

// 2. capturePaymentForMyOrderIntoDB
const capturePaymentForMyOrderIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
  amount?: number,
) => {
  if (!stripe) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe is not configured',
    );
  }

  let payment = await PaymentModel.findOne({
    order: orderId,
    customer: userId,
  });

  if (!payment) {
    const created = await createPaymentIntentForMyOrderIntoDB(
      userId,
      orderId,
      amount,
    );
    payment = created.doc;
  }

  const order = await OrderModel.findById(orderId);
  if (!order) return null;

  if (payment.status === 'succeeded') {
    return payment;
  }

  const activePricing = await PricingModel.findOne({}).sort({ createdAt: -1 });
  const driverPct = activePricing?.driverEarningPercentage ?? 70;
  if (!payment.stripePaymentIntentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment intent is missing for this order',
    );
  }

  const intent = await stripe.paymentIntents.confirm(
    payment.stripePaymentIntentId,
  );

  const stripeChargeId = intent.latest_charge as string | undefined;

  const updated = await PaymentModel.findOneAndUpdate(
    { _id: payment._id },
    {
      $set: {
        status: 'succeeded',
        capturedAt: new Date(),
        stripeChargeId,
      },
    },
    { returnDocument: 'after' },
  );

  const driverProfile = order.driver
    ? await DriverModel.findOne({ user: order.driver })
    : null;

  if (driverProfile) {
    const amountGross = updated?.amount ?? payment.amount;
    const amountDriver = (amountGross * driverPct) / 100;
    const amountPlatform = amountGross - amountDriver;

    await EarningModel.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          driver: driverProfile._id,
          order: order._id,
          amountGross,
          amountDriver,
          amountPlatform,
          payoutStatus: 'PENDING',
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  await InvoiceService.createInvoiceIntoDB(
    orderId,
    updated?.amount ?? payment.amount,
  );

  return updated;
};

// 3. getPaymentByOrderIdFromDB
const getPaymentByOrderIdFromDB = async (orderId: string) => {
  return PaymentModel.findOne({ order: orderId });
};

export const PaymentService = {
  createPaymentIntentForMyOrderIntoDB,
  capturePaymentForMyOrderIntoDB,
  getPaymentByOrderIdFromDB,
};
