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
import { ROLE } from '../User/user.constant';

const stripe = config.stripe_secret_key
  ? new Stripe(config.stripe_secret_key, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null;

type TStripePaymentIntent = {
  id: string;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'requires_capture'
    | 'canceled'
    | 'succeeded';
  latest_charge?: string | { id?: string } | null;
  metadata?: Record<string, string>;
};

const getValidatedTipAmount = (tipAmount?: number) => {
  if (tipAmount === undefined || tipAmount === null) return 0;
  if (!Number.isFinite(tipAmount) || tipAmount < 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid tip amount');
  }

  return Math.round(tipAmount * 100) / 100;
};

const getEffectiveBagCount = (order: { bagCountAtPickup?: number; bagCountAtDelivery?: number; bags: number }) =>
  Math.max(0, order.bagCountAtDelivery ?? order.bagCountAtPickup ?? order.bags ?? 0);

const getOrderForCustomerPayment = async (
  userId: Types.ObjectId,
  orderId: string,
) => {
  const order = await OrderModel.findOne({ _id: orderId, customer: userId });
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  return order;
};

const createStripePaymentIntent = async (
  orderId: string,
  userId: Types.ObjectId,
  amount: number,
  card: {
    stripeCustomerId: string;
    stripePaymentMethodId: string;
  },
  driverPct: number,
) => {
  if (!stripe) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe is not configured',
    );
  }

  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    customer: card.stripeCustomerId,
    payment_method: card.stripePaymentMethodId,
    confirm: false,
    metadata: {
      orderId,
      customerId: String(userId),
      driverEarningPercentage: String(driverPct),
    },
  });
};

const finalizeSucceededPayment = async (
  paymentId: Types.ObjectId,
  stripePaymentIntent: TStripePaymentIntent,
) => {
  const stripeChargeId =
    typeof stripePaymentIntent.latest_charge === 'string'
      ? stripePaymentIntent.latest_charge
      : stripePaymentIntent.latest_charge
        ? stripePaymentIntent.latest_charge.id
        : undefined;

  const updated = await PaymentModel.findOneAndUpdate(
    { _id: paymentId },
    {
      $set: {
        status: 'succeeded',
        capturedAt: new Date(),
        stripeChargeId,
      },
    },
    { returnDocument: 'after' },
  );

  if (!updated) return null;

  const order = await OrderModel.findById(updated.order);
  if (!order) return updated;

  const activePricing = await PricingModel.findOne({}).sort({ createdAt: -1 });
  const driverPct =
    Number(
      stripePaymentIntent.metadata
        ? stripePaymentIntent.metadata.driverEarningPercentage
        : undefined,
    ) ||
    (activePricing ? activePricing.driverEarningPercentage : undefined) ||
    70;
  const driverProfile = order.driver
    ? await DriverModel.findOne({ user: order.driver })
    : null;

  if (driverProfile) {
    const amountGross = updated.amount;
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

  await InvoiceService.createInvoiceIntoDB(String(order._id), updated.amount);

  return updated;
};

// 1. createPaymentIntentForMyOrderIntoDB
const createPaymentIntentForMyOrderIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
  tipAmount?: number,
) => {
  if (!stripe) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe is not configured',
    );
  }

  const order = await getOrderForCustomerPayment(userId, orderId);
  const activePricing = await PricingModel.findOne({}).sort({ createdAt: -1 });
  const driverPct = activePricing
    ? activePricing.driverEarningPercentage
    : 70;
  const totalAmount =
    getEffectiveBagCount(order) * Number(order.pricePerBag ?? 0) + getValidatedTipAmount(tipAmount);

  const card = await CardModel.findOne({
    user: userId,
    isDefault: true,
  });

  if (!card || !card.stripeCustomerId || !card.stripePaymentMethodId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Default payment card not found',
    );
  }

  const intent = await createStripePaymentIntent(
    String(order._id),
    userId,
    totalAmount,
    card,
    driverPct,
  );

  const doc = await PaymentModel.findOneAndUpdate(
    { order: order._id, customer: userId },
    {
      $set: {
        order: order._id,
        customer: userId,
        amount: totalAmount,
        stripePaymentIntentId: intent.id,
        status: 'requires_confirmation',
      },
      $unset: {
        stripeChargeId: 1,
        capturedAt: 1,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  return { doc, clientSecret: intent.client_secret };
};

// 2. capturePaymentForMyOrderIntoDB
const capturePaymentForMyOrderIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
  tipAmount?: number,
) => {
  if (!stripe) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe is not configured',
    );
  }

  const order = await getOrderForCustomerPayment(userId, orderId);
  const totalAmount =
    getEffectiveBagCount(order) * Number(order.pricePerBag ?? 0) + getValidatedTipAmount(tipAmount);
  let payment = await PaymentModel.findOne({
    order: orderId,
    customer: userId,
  });

  if (!payment) {
    const created = await createPaymentIntentForMyOrderIntoDB(
      userId,
      orderId,
      tipAmount,
    );
    payment = created.doc;
  }

  if (payment.status === 'succeeded') {
    return payment;
  }

  const activePricing = await PricingModel.findOne({}).sort({ createdAt: -1 });
  const driverPct = activePricing
    ? activePricing.driverEarningPercentage
    : 70;
  const card = await CardModel.findOne({
    user: userId,
    isDefault: true,
  });

  if (!card || !card.stripeCustomerId || !card.stripePaymentMethodId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Default payment card not found',
    );
  }

  if (!payment.stripePaymentIntentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment intent is missing for this order',
    );
  }

  if (Math.round(payment.amount * 100) !== Math.round(totalAmount * 100)) {
    await stripe.paymentIntents
      .cancel(payment.stripePaymentIntentId)
      .catch(() => undefined);
    const replacementIntent = await createStripePaymentIntent(
      String(order._id),
      userId,
      totalAmount,
      card,
      driverPct,
    );
    payment = await PaymentModel.findOneAndUpdate(
      { _id: payment._id },
      {
        $set: {
          amount: totalAmount,
          stripePaymentIntentId: replacementIntent.id,
          status: 'requires_confirmation',
        },
        $unset: {
          stripeChargeId: 1,
          capturedAt: 1,
        },
      },
      { returnDocument: 'after' },
    );
  }

  if (!payment || !payment.stripePaymentIntentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment intent is missing for this order',
    );
  }

  const intent = await stripe.paymentIntents.confirm(
    payment.stripePaymentIntentId,
  );

  if (intent.status !== 'succeeded') {
    const updated = await PaymentModel.findOneAndUpdate(
      { _id: payment._id },
      { $set: { status: intent.status } },
      { returnDocument: 'after' },
    );

    if (intent.status === 'requires_action') {
      throw new AppError(
        httpStatus.PAYMENT_REQUIRED,
        'Payment requires additional authentication',
      );
    }

    return updated;
  }

  return finalizeSucceededPayment(payment._id, intent);
};

// 3. getPaymentByOrderIdFromDB
const getPaymentByOrderIdFromDB = async (
  orderId: string,
  userId: Types.ObjectId,
  role?: string,
) => {
  if (role === ROLE.ADMIN || role === ROLE.SUPER_ADMIN) {
    return PaymentModel.findOne({ order: orderId });
  }

  const order = await OrderModel.findOne({
    _id: orderId,
    $or: [{ customer: userId }, { driver: userId }],
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  return PaymentModel.findOne({ order: orderId });
};

const handleStripeWebhookIntoDB = async (
  payload: Buffer,
  signature?: string,
) => {
  if (!stripe || !config.stripe_webhook_secret) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe webhook is not configured',
    );
  }

  if (!signature) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Missing Stripe signature');
  }

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe_webhook_secret,
  );

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as unknown as TStripePaymentIntent;
    const payment = await PaymentModel.findOne({
      stripePaymentIntentId: intent.id,
    });

    if (payment && payment.status !== 'succeeded') {
      await finalizeSucceededPayment(payment._id, intent);
    }
  }

  if (
    event.type === 'payment_intent.payment_failed' ||
    event.type === 'payment_intent.canceled' ||
    event.type === 'payment_intent.processing' ||
    event.type === 'payment_intent.requires_action'
  ) {
    const intent = event.data.object as unknown as TStripePaymentIntent;
    await PaymentModel.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { $set: { status: intent.status } },
    );
  }

  return { received: true, type: event.type };
};

export const PaymentService = {
  createPaymentIntentForMyOrderIntoDB,
  capturePaymentForMyOrderIntoDB,
  getPaymentByOrderIdFromDB,
  handleStripeWebhookIntoDB,
};
