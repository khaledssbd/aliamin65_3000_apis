import PaymentModel from './payment.model';
import { Types } from 'mongoose';
import OrderModel from '../Order/order.model';
import CardModel from '../Card/card.model';
import DriverModel from '../Driver/driver.model';
import EarningModel from '../Earning/earning.model';
import Stripe from 'stripe';
import config from '../../config';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import { InvoiceService } from '../Invoice/invoice.service';
import { ROLE } from '../User/user.constant';
import { ORDER_STATUS } from '../../constants';

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

type TDriverTransferDetails = {
  driverAccountId: string;
  driverPct: number;
  driverAmount: number;
  platformAmount: number;
};

const getValidatedTipAmount = (tipAmount?: number) => {
  if (tipAmount === undefined || tipAmount === null) return 0;
  if (!Number.isFinite(tipAmount) || tipAmount < 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid tip amount');
  }

  return Math.round(tipAmount * 100) / 100;
};

const getEffectiveBagCount = (order: {
  bagCountAtPickup?: number;
  bagCountAtDelivery?: number;
  bags: number;
}) =>
  Math.max(
    0,
    order.bagCountAtDelivery ?? order.bagCountAtPickup ?? order.bags ?? 0,
  );

const getOrderDriverEarningPercentage = (order: {
  driverEarningPercentage?: number;
}) => {
  const percentage = Number(order.driverEarningPercentage);

  return Number.isFinite(percentage) && percentage > 0 ? percentage : 70;
};

const getPaymentSplitAmounts = (amount: number, driverPct: number) => {
  const amountDriver = Math.round(((amount * driverPct) / 100) * 100) / 100;
  const amountPlatform = Math.round((amount - amountDriver) * 100) / 100;

  return { amountDriver, amountPlatform };
};

const getDriverTransferDetailsForOrder = async (
  order: {
    driver?: Types.ObjectId;
    driverEarningPercentage?: number;
  },
  amount: number,
): Promise<TDriverTransferDetails> => {
  if (!order.driver) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Driver is required before payment can be collected.',
    );
  }

  const driverProfile = await DriverModel.findOne({
    user: order.driver,
  }).select('stripeConnectedAccountId');

  if (!driverProfile?.stripeConnectedAccountId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Driver Stripe account is not connected.',
    );
  }

  const driverPct = getOrderDriverEarningPercentage(order);
  const { amountDriver, amountPlatform } = getPaymentSplitAmounts(
    amount,
    driverPct,
  );

  return {
    driverAccountId: driverProfile.stripeConnectedAccountId,
    driverPct,
    driverAmount: amountDriver,
    platformAmount: amountPlatform,
  };
};

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

const getPreferredCardForPayment = async (userId: Types.ObjectId) => {
  const card = await CardModel.findOne({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  if (!card) {
    return null;
  }

  if (!card.isDefault) {
    await CardModel.updateMany(
      { user: userId },
      { $set: { isDefault: false } },
    );
    card.isDefault = true;
    await CardModel.findByIdAndUpdate(card._id, { $set: { isDefault: true } });
  }

  return card;
};

const createStripePaymentIntent = async (
  orderId: string,
  userId: Types.ObjectId,
  amount: number,
  card: {
    stripeCustomerId: string;
    stripePaymentMethodId: string;
  },
  transferDetails: TDriverTransferDetails,
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
    application_fee_amount: Math.round(transferDetails.platformAmount * 100),
    transfer_data: {
      destination: transferDetails.driverAccountId,
    },
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
    confirm: false,
    metadata: {
      orderId,
      customerId: String(userId),
      driverEarningPercentage: String(transferDetails.driverPct),
      driverAmount: String(transferDetails.driverAmount),
      platformAmount: String(transferDetails.platformAmount),
      driverStripeAccountId: transferDetails.driverAccountId,
    },
  });
};

const isReturnUrlRequiredError = (error: unknown) => {
  const message =
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : '';

  return message.includes('return_url') || message.includes('allow_redirects');
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

  if (order.status !== ORDER_STATUS.COMPLETED) {
    await OrderModel.findByIdAndUpdate(order._id, {
      $set: {
        status: ORDER_STATUS.COMPLETED,
        'timeline.completedAt': new Date(),
      },
    });
  }

  const driverPct =
    Number(
      stripePaymentIntent.metadata
        ? stripePaymentIntent.metadata.driverEarningPercentage
        : undefined,
    ) || getOrderDriverEarningPercentage(order);
  const metadataDriverAmount = Number(
    stripePaymentIntent.metadata?.driverAmount,
  );
  const metadataPlatformAmount = Number(
    stripePaymentIntent.metadata?.platformAmount,
  );
  const wasTransferredToDriver = Boolean(
    stripePaymentIntent.metadata?.driverStripeAccountId,
  );
  const driverProfile = order.driver
    ? await DriverModel.findOne({ user: order.driver })
    : null;

  if (driverProfile) {
    const amountGross = updated.amount;
    const split = getPaymentSplitAmounts(amountGross, driverPct);
    const amountDriver = Number.isFinite(metadataDriverAmount)
      ? metadataDriverAmount
      : split.amountDriver;
    const amountPlatform = Number.isFinite(metadataPlatformAmount)
      ? metadataPlatformAmount
      : split.amountPlatform;

    await EarningModel.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          driver: driverProfile._id,
          order: order._id,
          amountGross,
          amountDriver,
          amountPlatform,
          payoutStatus: wasTransferredToDriver ? 'PAID' : 'PENDING',
          ...(wasTransferredToDriver ? { payoutAt: new Date() } : {}),
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  await InvoiceService.createInvoiceIntoDB(String(order._id), updated.amount);

  return updated;
};

const replacePaymentIntentForPayment = async ({
  payment,
  orderId,
  userId,
  totalAmount,
  card,
  transferDetails,
}: {
  payment: NonNullable<Awaited<ReturnType<typeof PaymentModel.findOne>>>;
  orderId: string;
  userId: Types.ObjectId;
  totalAmount: number;
  card: {
    stripeCustomerId: string;
    stripePaymentMethodId: string;
  };
  transferDetails: TDriverTransferDetails;
}) => {
  if (payment.stripePaymentIntentId) {
    await stripe?.paymentIntents
      .cancel(payment.stripePaymentIntentId)
      .catch(() => undefined);
  }

  const replacementIntent = await createStripePaymentIntent(
    orderId,
    userId,
    totalAmount,
    card,
    transferDetails,
  );

  return PaymentModel.findOneAndUpdate(
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
  const totalAmount =
    getEffectiveBagCount(order) * Number(order.pricePerBag ?? 0) +
    getValidatedTipAmount(tipAmount);
  const transferDetails = await getDriverTransferDetailsForOrder(
    order,
    totalAmount,
  );

  const card = await getPreferredCardForPayment(userId);

  if (!card || !card.stripeCustomerId || !card.stripePaymentMethodId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No saved payment card found. Please add a card first.',
    );
  }

  const intent = await createStripePaymentIntent(
    String(order._id),
    userId,
    totalAmount,
    card,
    transferDetails,
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
    getEffectiveBagCount(order) * Number(order.pricePerBag ?? 0) +
    getValidatedTipAmount(tipAmount);
  const transferDetails = await getDriverTransferDetailsForOrder(
    order,
    totalAmount,
  );

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

  const card = await getPreferredCardForPayment(userId);

  if (!card || !card.stripeCustomerId || !card.stripePaymentMethodId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No saved payment card found. Please add a card first.',
    );
  }

  if (!payment.stripePaymentIntentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment intent is missing for this order',
    );
  }

  if (Math.round(payment.amount * 100) !== Math.round(totalAmount * 100)) {
    payment = await replacePaymentIntentForPayment({
      payment,
      orderId: String(order._id),
      userId,
      totalAmount,
      card,
      transferDetails,
    });
  }

  if (!payment || !payment.stripePaymentIntentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment intent is missing for this order',
    );
  }

  const existingIntent = await stripe.paymentIntents.retrieve(
    payment.stripePaymentIntentId,
  );

  if (
    existingIntent.metadata?.driverStripeAccountId !==
      transferDetails.driverAccountId ||
    Number(existingIntent.metadata?.driverAmount) !==
      transferDetails.driverAmount ||
    Number(existingIntent.metadata?.platformAmount) !==
      transferDetails.platformAmount
  ) {
    payment = await replacePaymentIntentForPayment({
      payment,
      orderId: String(order._id),
      userId,
      totalAmount,
      card,
      transferDetails,
    });
  }

  if (!payment || !payment.stripePaymentIntentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment intent is missing for this order',
    );
  }

  let intent: TStripePaymentIntent;

  try {
    intent = await stripe.paymentIntents.confirm(payment.stripePaymentIntentId);
  } catch (error) {
    if (!isReturnUrlRequiredError(error)) {
      throw error;
    }

    payment = await replacePaymentIntentForPayment({
      payment,
      orderId: String(order._id),
      userId,
      totalAmount,
      card,
      transferDetails,
    });

    if (!payment || !payment.stripePaymentIntentId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Payment intent is missing for this order',
      );
    }

    intent = await stripe.paymentIntents.confirm(payment.stripePaymentIntentId);
  }

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

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid Stripe webhook';

    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Stripe webhook error: ${message}`,
    );
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as TStripePaymentIntent;
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
    const intent = event.data.object as TStripePaymentIntent;
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
