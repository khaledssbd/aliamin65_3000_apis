import DriverModel from './driver.model';
import { Types } from 'mongoose';
import OrderModel from '../Order/order.model';
import UserModel from '../User/user.model';
import { ORDER_STATUS } from '../../constants';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import Stripe from 'stripe';
import config from '../../config';

const stripe = config.stripe_secret_key
  ? new Stripe(config.stripe_secret_key, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null;

// 1. upsertDriverProfileIntoDB
const upsertDriverProfileIntoDB = async (
  userId: Types.ObjectId,
  payload: Record<string, unknown>,
) => {
  const doc = await DriverModel.findOneAndUpdate({ user: userId }, payload, {
    upsert: true,
    returnDocument: 'after',
    setDefaultsOnInsert: true,
  });

  return doc;
};

// 2. setDriverAvailabilityIntoDB
const setDriverAvailabilityIntoDB = async (
  userId: Types.ObjectId,
  isAvailable: boolean,
) => {
  const doc = await DriverModel.findOneAndUpdate(
    { user: userId },
    { $set: { isAvailable } },
    { returnDocument: 'after' },
  );
  return doc;
};

// 3. getDriverProfileFromDB
const getDriverProfileFromDB = async (userId: Types.ObjectId) => {
  return DriverModel.findOne({ user: userId });
};

const getStripeAccountSummary = async (accountId?: string) => {
  if (!accountId || !stripe) {
    return {
      accountId,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    };
  }

  const account = await stripe.accounts.retrieve(accountId);

  return {
    accountId: account.id,
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
  };
};

const getStripeConnectRedirectUrl = (value?: string) => {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? value : undefined;
  } catch {
    return undefined;
  }
};

const createStripeConnectAccountLinkIntoDB = async (
  userId: Types.ObjectId,
  payload?: { returnUrl?: string; refreshUrl?: string },
) => {
  if (!stripe) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Stripe is not configured');
  }

  const user = await UserModel.findById(userId).select('email name phone');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const driver = await DriverModel.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    },
  );

  let accountId = driver.stripeConnectedAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      business_type: 'individual',
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        driverUserId: String(userId),
      },
    });

    accountId = account.id;
    driver.stripeConnectedAccountId = account.id;
    await driver.save();
  }

  const returnUrl =
    getStripeConnectRedirectUrl(payload?.returnUrl) ||
    getStripeConnectRedirectUrl(config.stripe_connect_return_url) ||
    'https://example.com/stripe-connect/return';
  const refreshUrl =
    getStripeConnectRedirectUrl(payload?.refreshUrl) ||
    getStripeConnectRedirectUrl(config.stripe_connect_refresh_url) ||
    returnUrl;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    return_url: returnUrl,
    refresh_url: refreshUrl,
  });

  return {
    ...(await getStripeAccountSummary(accountId)),
    onboardingUrl: accountLink.url,
  };
};

const getStripeConnectStatusFromDB = async (userId: Types.ObjectId) => {
  const driver = await DriverModel.findOne({ user: userId }).select(
    'stripeConnectedAccountId',
  );

  return getStripeAccountSummary(driver?.stripeConnectedAccountId);
};

const ensureDriverStripeConnectReady = async (accountId?: string) => {
  const status = await getStripeAccountSummary(accountId);

  if (!status.accountId || !status.detailsSubmitted || !status.payoutsEnabled) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please connect Stripe before accepting orders.',
    );
  }
};

// 4. getAvailableJobsForDriverFromDB
const getAvailableJobsForDriverFromDB = async (userId: Types.ObjectId) => {
  const driver = await DriverModel.findOne({ user: userId }).select(
    'capacityLimit status stripeConnectedAccountId',
  );

  if (!driver || driver.status !== 'APPROVED') return [];

  const stripeStatus = await getStripeAccountSummary(
    driver.stripeConnectedAccountId,
  );

  if (!stripeStatus.detailsSubmitted || !stripeStatus.payoutsEnabled) {
    return [];
  }

  const activeJobsCount = await OrderModel.countDocuments({
    driver: userId,
    status: {
      $nin: [
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.COMPLETED,
        ORDER_STATUS.CANCELED,
      ],
    },
  });

  if (activeJobsCount >= Number(driver.capacityLimit ?? 3)) return [];

  return OrderModel.find({
    status: ORDER_STATUS.REQUESTED,
    driver: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .limit(50);
};

// getMyJobsForDriverFromDB
const getMyJobsForDriverFromDB = async (userId: Types.ObjectId) => {
  return OrderModel.find({ driver: userId })
    .sort({ createdAt: -1 })
    .populate('customer', 'name email phone image address')
    .limit(100);
};

// 5. acceptJobByDriverIntoDB
const acceptJobByDriverIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
) => {
  const driver = await DriverModel.findOne({ user: userId });
  if (!driver) return null;

  await ensureDriverStripeConnectReady(driver.stripeConnectedAccountId);

  const activeJobsCount = await OrderModel.countDocuments({
    driver: userId,
    status: {
      $nin: [
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.COMPLETED,
        ORDER_STATUS.CANCELED,
      ],
    },
  });

  if (activeJobsCount >= Number(driver.capacityLimit ?? 3)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Driver capacity limit reached!');
  }

  const doc = await OrderModel.findOneAndUpdate(
    {
      _id: orderId,
      status: ORDER_STATUS.REQUESTED,
      driver: { $exists: false },
    },
    {
      $set: {
        // Order.driver references User, not Driver
        driver: userId,
        status: ORDER_STATUS.DRIVER_ASSIGNED,
        'timeline.driverAssignedAt': new Date(),
      },
      $unset: { pendingDriver: 1 },
    },
    { returnDocument: 'after' },
  );
  return doc;
};

// 6. declineJobByDriverIntoDB
const declineJobByDriverIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
) => {
  // In a real scenario, we might track which drivers declined which jobs to avoid re-offering
  // For now, we'll just return success to indicate the driver's intent was handled
  return { userId, orderId, declined: true, declinedAt: new Date() };
};

// 7. cancelJobByDriverIntoDB
const cancelJobByDriverIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
  reason?: string,
) => {
  const driver = await DriverModel.findOne({ user: userId });
  if (!driver) return null;

  const doc = await OrderModel.findOneAndUpdate(
    // Order.driver references User, not Driver
    { _id: orderId, driver: userId },
    {
      $set: { driver: null, status: ORDER_STATUS.REQUESTED },
      $push: { 'timeline.canceledAt': new Date() },
    },
    { returnDocument: 'after' },
  );
  return { order: doc, reason };
};

const updateJobStageByDriverIntoDB = async (
  userId: Types.ObjectId,
  orderId: string,
  stage: 'PICKUP' | 'WASHING' | 'DRYING' | 'FOLDING' | 'DELIVERY',
  bagCount?: number,
) => {
  const currentOrder = await OrderModel.findOne({
    _id: orderId,
    driver: userId,
  }).select('status');

  if (!currentOrder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Driver job not found!');
  }

  if (
    currentOrder.status === ORDER_STATUS.COMPLETED ||
    currentOrder.status === ORDER_STATUS.CANCELED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This order is already completed and cannot be updated.',
    );
  }

  const now = new Date();
  const patch: Record<string, unknown> = {};

  if (stage === 'PICKUP') {
    patch.status = ORDER_STATUS.PICKED_UP;
    patch['timeline.pickedUpAt'] = now;
    if (typeof bagCount === 'number' && Number.isFinite(bagCount)) {
      patch.bagCountAtPickup = Math.max(0, bagCount);
    }
  }

  if (stage === 'WASHING') {
    patch.status = ORDER_STATUS.WASHING_DRYING;
    patch['timeline.washingDryingAt'] = now;
  }

  if (stage === 'DRYING') {
    patch.status = ORDER_STATUS.DRYING;
    patch['timeline.dryingAt'] = now;
  }

  if (stage === 'FOLDING') {
    patch.status = ORDER_STATUS.FOLDING;
    patch['timeline.foldingAt'] = now;
  }

  if (stage === 'DELIVERY') {
    patch.status = ORDER_STATUS.OUT_FOR_DELIVERY;
    patch['timeline.outForDeliveryAt'] = now;
  }

  if (Object.keys(patch).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid job stage!');
  }

  const updatedOrder = await OrderModel.findOneAndUpdate(
    { _id: orderId, driver: userId },
    { $set: patch },
    { returnDocument: 'after' },
  ).populate('customer', 'name email phone image address');

  return updatedOrder;
};

export const DriverService = {
  upsertDriverProfileIntoDB,
  setDriverAvailabilityIntoDB,
  getDriverProfileFromDB,
  createStripeConnectAccountLinkIntoDB,
  getStripeConnectStatusFromDB,
  getAvailableJobsForDriverFromDB,
  getMyJobsForDriverFromDB,
  acceptJobByDriverIntoDB,
  declineJobByDriverIntoDB,
  cancelJobByDriverIntoDB,
  updateJobStageByDriverIntoDB,
};
