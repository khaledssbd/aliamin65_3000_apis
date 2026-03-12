import PaymentModel from './payment.model';
import { Types } from 'mongoose';
import OrderModel from '../Order/order.model';
import PricingModel from '../Pricing/pricing.model';
import DriverModel from '../Driver/driver.model';
import CardModel from '../Card/card.model';
import config from '../../config';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
// In case env is not configured yet, we keep a fallback-safe client
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');
const stripe =
  stripeSecret && typeof stripeSecret === 'string'
    ? new Stripe(stripeSecret, { apiVersion: '2025-04-30' })
    : null;

// 1. createPaymentIntentForMyOrderIntoDB
const createPaymentIntentForMyOrderIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
  amount?: number,
) => {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const activePricing = await PricingModel.findOne({}).sort({ createdAt: -1 });
  const driverPct = activePricing?.driverEarningPercentage ?? 70;
  const totalAmount = amount ?? order.total;

  const card = await CardModel.findOne({
    user: userId,
    isDefault: true,
  });

  const stripeCustomerId = card?.stripeCustomerId ?? 'cus_demo';

  let paymentIntentSecret = `pi_demo_${orderId}_secret`;
  let stripePaymentIntentId: string | undefined;

  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: card?.stripePaymentMethodId,
      confirm: false,
      metadata: {
        orderId: String(order._id),
        customerId: String(userId),
        driverEarningPercentage: String(driverPct),
      },
    });
    paymentIntentSecret = intent.client_secret ?? paymentIntentSecret;
    stripePaymentIntentId = intent.id;
  }

  const doc = await PaymentModel.create({
    order: order._id,
    customer: userId,
    amount: totalAmount,
    stripePaymentIntentId,
    status: 'requires_confirmation',
  });

  return { doc, clientSecret: paymentIntentSecret };
};

// 2. capturePaymentForMyOrderIntoDB
const capturePaymentForMyOrderIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
) => {
  const payment = await PaymentModel.findOne({
    order: orderId,
    customer: userId,
  });
  if (!payment) return null;

  const order = await OrderModel.findById(orderId);
  if (!order) return null;

  const activePricing = await PricingModel.findOne({}).sort({ createdAt: -1 });
  const driverPct = activePricing?.driverEarningPercentage ?? 70;

  const driverUser = order.driver
    ? await DriverModel.findOne({ user: order.driver }).populate('user')
    : null;

  const driverShare = (order.total * driverPct) / 100;
  const adminShare = order.total - driverShare;

  let stripeChargeId: string | undefined;

  if (stripe && payment.stripePaymentIntentId) {
    const intent = await stripe.paymentIntents.confirm(
      payment.stripePaymentIntentId,
    );

    // In a real Stripe Connect setup, you would:
    // - charge the customer to the platform account
    // - create a transfer or use transfer_data to pay the connected driver account
    // Here we only document the split in amounts and keep a single charge.
    stripeChargeId =
      (intent.charges &&
        intent.charges.data &&
        intent.charges.data[0] &&
        intent.charges.data[0].id) ||
      undefined;
  }

  const updated = await PaymentModel.findOneAndUpdate(
    { _id: payment._id },
    {
      $set: {
        status: 'succeeded',
        capturedAt: new Date(),
        stripeChargeId,
      },
    },
    { new: true },
  );

  // In DB you can also store the computed split if you want:
  // - adminShare
  // - driverShare
  // For now we just return the payment document.

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
