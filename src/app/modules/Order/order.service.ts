import OrderModel from './order.model';
import PricingModel from '../Pricing/pricing.model';
import { ORDER_STATUS } from '../../constants';
import { Types } from 'mongoose';
import { IUser } from '../User/user.interface';
import { TOrderStatus, TPickupType, TServiceType } from './order.interface';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import DriverModel from '../Driver/driver.model';
import RatingModel from '../Rating/rating.model';

const CANCELLABLE_BEFORE_PICKUP_STATUSES: TOrderStatus[] = [
  ORDER_STATUS.DRIVER_ASSIGNED,
];

// 0. computeTotal
// const computeTotal = async (bags: number, tip = 0) => {
//   const active = await PricingModel.findOne({ active: true });
//   const pricePerBag = active?.pricePerBag ?? 45;
//   const total = bags * pricePerBag + tip;
//   return { pricePerBag, total };
// };
const computeTotal = async (bags: number) => {
  const active = await PricingModel.findOne({});
  const pricePerBag = active?.pricePerBag ?? 45;
  const driverEarningPercentage = active?.driverEarningPercentage ?? 70;
  const total = bags * pricePerBag;
  return { driverEarningPercentage, pricePerBag, total };
};

// 1. createOrderIntoDB
const createOrderIntoDB = async (
  customer: IUser,
  payload: {
    serviceType: TServiceType;
    pickupType: TPickupType;
    scheduledPickupAt?: string;
    bags: number;
    specialInstructions?: string;
    pickupLat?: number;
    pickupLng?: number;
    expectedRadiusKm?: number;
  },
) => {
  const { driverEarningPercentage, total, pricePerBag } = await computeTotal(
    payload.bags,
  );

  const pickupLat =
    typeof payload.pickupLat === 'number'
      ? payload.pickupLat
      : payload.pickupLat
        ? Number(payload.pickupLat)
        : undefined;
  const pickupLng =
    typeof payload.pickupLng === 'number'
      ? payload.pickupLng
      : payload.pickupLng
        ? Number(payload.pickupLng)
        : undefined;

  const pickupLocation =
    typeof pickupLat === 'number' &&
    Number.isFinite(pickupLat) &&
    typeof pickupLng === 'number' &&
    Number.isFinite(pickupLng)
      ? { type: 'Point' as const, coordinates: [pickupLng, pickupLat] }
      : undefined;

  const expectedRadiusKm =
    payload.expectedRadiusKm !== undefined && payload.expectedRadiusKm !== null
      ? Math.max(0.1, Number(payload.expectedRadiusKm))
      : undefined;

  const result = await OrderModel.create({
    customer: customer._id,
    scheduledPickupAt: payload.scheduledPickupAt,
    address: customer.address,
    serviceType: payload.serviceType,
    pickupType: payload.pickupType,
    bags: payload.bags,
    specialInstructions: payload.specialInstructions,
    pickupLocation,
    expectedRadiusKm,
    status: ORDER_STATUS.REQUESTED,
    pricePerBag,
    driverEarningPercentage,
    total,
    timeline: { requestedAt: new Date() },
  });

  return result;
};

// 2. getMyOrdersFromDB
const getMyOrdersFromDB = async (customerId: Types.ObjectId) => {
  const orders = await OrderModel.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .populate('customer', 'name email phone image address')
    .populate('driver', 'name email phone image role isActive')
    .lean();

  const orderIds = orders.map((order) => order._id);
  const ratings = await RatingModel.find({
    customer: customerId,
    order: { $in: orderIds },
  }).lean();
  const ratingByOrder = new Map(
    ratings.map((rating) => [String(rating.order), rating]),
  );

  return orders.map((order) => ({
    ...order,
    myRating: ratingByOrder.get(String(order._id)) ?? null,
  }));
};

// 3. getOrderByIdFromDB
const getOrderByIdFromDB = async (id: string, userId?: Types.ObjectId) => {
  const filter: Record<string, unknown> = { _id: id };

  if (userId) filter.$or = [{ customer: userId }, { driver: userId }];
  const order = await OrderModel.findOne(filter)
    .populate('customer', 'name email phone image address')
    .populate('driver', 'name email phone image role isActive')
    .lean();

  if (!order) return null;

  const driverUser =
    order.driver && typeof order.driver === 'object'
      ? (order.driver as { _id?: Types.ObjectId })
      : undefined;
  const driverUserId = driverUser?._id ?? order.driver;

  if (!driverUserId) return order;

  const [driverProfile, ratingAgg, trips] = await Promise.all([
    DriverModel.findOne({ user: driverUserId })
      .select(
        'user stripeConnectedAccountId licenseImageUrl selfieImageUrl identity isAvailable insurance vehicle backgroundCheckStatus reputationTier capacityLimit status createdAt updatedAt',
      )
      .lean(),
    RatingModel.aggregate([
      { $match: { driver: new Types.ObjectId(String(driverUserId)) } },
      {
        $group: {
          _id: '$driver',
          count: { $sum: 1 },
          avg: { $avg: '$rating' },
        },
      },
    ]),
    OrderModel.countDocuments({
      driver: driverUserId,
      status: ORDER_STATUS.COMPLETED,
    }),
  ]);

  const vehicle = driverProfile?.vehicle;
  const vehicleText =
    vehicle && (vehicle.make || vehicle.model || vehicle.year || vehicle.plate)
      ? [vehicle.year, vehicle.make, vehicle.model, vehicle.plate]
          .filter(Boolean)
          .join(' ')
      : 'Vehicle info unavailable';
  const hasInsurance = Boolean(
    driverProfile?.insurance?.provider ||
    driverProfile?.insurance?.policyNumber ||
    driverProfile?.insurance?.documentImageUrl,
  );
  const ratingSummary = ratingAgg[0] ?? {
    _id: driverUserId,
    count: 0,
    avg: 0,
  };

  return {
    ...order,
    driverProfile,
    driverRatingSummary: ratingSummary,
    driverRating: Number(ratingSummary.avg ?? 0),
    driverRatingCount: Number(ratingSummary.count ?? 0),
    driverTrips: trips,
    driverVehicleText: vehicleText,
    driverSafety: {
      verifiedDriver: driverProfile?.backgroundCheckStatus === 'APPROVED',
      insuredVehicle: hasInsurance,
      topRated:
        Number(ratingSummary.count ?? 0) > 0 &&
        Number(ratingSummary.avg ?? 0) >= 4.5,
    },
  };
};

// 4. assignDriverToOrderIntoDB
const assignDriverToOrderIntoDB = async (id: string, driverId: string) => {
  return OrderModel.findByIdAndUpdate(
    id,
    {
      $set: {
        driver: driverId,
        status: ORDER_STATUS.DRIVER_ASSIGNED,
        'timeline.driverAssignedAt': new Date(),
      },
    },
    { returnDocument: 'after' },
  );
};

// 5. updateOrderStatusIntoDB
const updateOrderStatusIntoDB = async (id: string, status: string) => {
  const patch: Record<string, unknown> = { status };
  const now = new Date();
  if (status === ORDER_STATUS.PICKED_UP) patch['timeline.pickedUpAt'] = now;
  if (status === ORDER_STATUS.WASHING_DRYING)
    patch['timeline.washingDryingAt'] = now;
  if (status === ORDER_STATUS.OUT_FOR_DELIVERY)
    patch['timeline.outForDeliveryAt'] = now;
  if (status === ORDER_STATUS.DELIVERED) patch['timeline.deliveredAt'] = now;
  if (status === ORDER_STATUS.COMPLETED) patch['timeline.completedAt'] = now;
  return OrderModel.findByIdAndUpdate(
    id,
    { $set: patch },
    { returnDocument: 'after' },
  );
};

// 6. updateBagCountIntoDB
const updateBagCountIntoDB = async (
  id: string,
  kind: 'pickup' | 'delivery',
  count: number,
) => {
  const field = kind === 'pickup' ? 'bagCountAtPickup' : 'bagCountAtDelivery';
  const order = await OrderModel.findById(id).select('pricePerBag bags');
  if (!order) return null;

  const effectiveCount = Math.max(0, count);
  const nextTotal = effectiveCount * Number(order.pricePerBag ?? 0);
  return OrderModel.findByIdAndUpdate(
    id,
    {
      $set: {
        [field]: effectiveCount,
        ...(kind === 'pickup' ? { total: nextTotal } : {}),
      },
    },
    { returnDocument: 'after' },
  );
};

// 7. cancelOrderBeforePickupIntoDB
const cancelOrderBeforePickupIntoDB = async (
  orderId: string,
  user: IUser,
  reason?: string,
) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid order id');
  }

  const order = await OrderModel.findById(orderId).select(
    'customer driver status',
  );

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found!');
  }

  const userId = String(user._id);
  const isCustomer = String(order.customer) === userId;
  const isAssignedDriver = order.driver && String(order.driver) === userId;

  if (!isCustomer && !isAssignedDriver) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to cancel this order.',
    );
  }

  if (!CANCELLABLE_BEFORE_PICKUP_STATUSES.includes(order.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This order can only be canceled after driver assignment and before pickup.',
    );
  }

  const releasedDriverId = order.driver ? String(order.driver) : undefined;
  const updatedOrder = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status: ORDER_STATUS.REQUESTED,
        canceledBy: user._id,
        canceledByRole: user.role,
        cancelReason: reason?.trim() || undefined,
        'timeline.canceledAt': new Date(),
      },
      $unset: {
        driver: 1,
        'timeline.driverAssignedAt': 1,
        bagCountAtPickup: 1,
        bagCountAtDelivery: 1,
      },
    },
    { returnDocument: 'after' },
  )
    .populate('customer', 'name email phone image address')
    .populate('driver', 'name email phone image role isActive');

  return { order: updatedOrder, releasedDriverId, reason };
};

export const OrderService = {
  computeTotal,
  createOrderIntoDB,
  getMyOrdersFromDB,
  getOrderByIdFromDB,
  assignDriverToOrderIntoDB,
  updateOrderStatusIntoDB,
  updateBagCountIntoDB,
  cancelOrderBeforePickupIntoDB,
};
