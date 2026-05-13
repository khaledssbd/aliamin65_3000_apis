import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { OrderService } from './order.service';
import { getIO } from '../../socket';
import DriverModel from '../Driver/driver.model';
import UserModel from '../User/user.model';
import { ORDER_STATUS } from '../../constants';

// 1. createOrder
const createOrder = asyncHandler(async (req, res) => {
  const result = await OrderService.createOrderIntoDB(req.user, req.body);

  const pickupLocation = result.pickupLocation;
  const expectedRadiusKm = result.expectedRadiusKm ?? 5; // fallback radius

  const availableDrivers = await DriverModel.find({ isAvailable: true }).select(
    'user',
  );

  // Load driver users with currentLocation
  const driverUserIds = availableDrivers.map((driver) => driver.user);
  const driverUsers = await UserModel.find({
    _id: { $in: driverUserIds },
  }).select('currentLocation');

  const driverLocationMap = new Map<
    string,
    { type?: string; coordinates?: number[] }
  >();

  driverUsers.forEach((driverUser) => {
    const location = driverUser.currentLocation;
    driverLocationMap.set(String(driverUser._id), location ?? {});
  });

  const deg2rad = (deg: number) => (deg * Math.PI) / 180;
  const haversineKm = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) => {
    const R = 6371; // km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  let targetDrivers = availableDrivers;

  if (
    pickupLocation &&
    Array.isArray(pickupLocation.coordinates) &&
    pickupLocation.coordinates.length === 2
  ) {
    const [pickupLng, pickupLat] = pickupLocation.coordinates;
    targetDrivers = availableDrivers.filter((driver) => {
      const uid = String(driver.user);
      const loc = driverLocationMap.get(uid);

      if (
        !loc ||
        !Array.isArray(loc.coordinates) ||
        loc.coordinates.length !== 2
      ) {
        return false;
      }

      const [driverLng, driverLat] = loc.coordinates;
      const distKm = haversineKm(pickupLat, pickupLng, driverLat, driverLng);
      return distKm <= expectedRadiusKm;
    });
  }

  // If no drivers matched by radius, fall back to all available
  const targets = targetDrivers.length ? targetDrivers : availableDrivers;

  const ordersNs = getIO()?.of('/orders');

  targets.forEach((driver) => {
    const driverUserId = String(driver.user);

    ordersNs?.to(`driver:${driverUserId}`).emit('driver:job:new', {
      order: {
        orderId: result._id,
        address: result.address,
        serviceType: result.serviceType,
        pickupLocation: result.pickupLocation,
        pickupType: result.pickupType,
        scheduledPickupAt: result.scheduledPickupAt,
        bags: result.bags,
        expectedRadiusKm: result.expectedRadiusKm,
        total: result.total,
        status: result.status,
        createdAt: result.createdAt,
      },
    });
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Order created successfully!',
    data: result,
  });
});

// 2. getMyOrders
const getMyOrders = asyncHandler(async (req, res) => {
  const result = await OrderService.getMyOrdersFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Orders fetched successfully!',
    data: result,
  });
});

// 3. getOrderById
const getOrderById = asyncHandler(async (req, res) => {
  const result = await OrderService.getOrderByIdFromDB(
    String(req.params.id),
    req.user._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order fetched successfully!',
    data: result,
  });
});

// 4. assignDriverToOrder
const assignDriverToOrder = asyncHandler(async (req, res) => {
  const result = await OrderService.assignDriverToOrderIntoDB(
    String(req.params.id),
    req.body.driverId,
  );

  getIO()?.emit('order:assigned', {
    orderId: result?._id,
    driverId: result?.driver,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver assigned successfully!',
    data: result,
  });
});

// 5. updateOrderStatus
const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await OrderService.updateOrderStatusIntoDB(
    String(req.params.id),
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order status updated successfully!',
    data: result,
  });
});

// 6. completeDeliveryAndCapturePayment
const completeDeliveryAndCapturePayment = asyncHandler(async (req, res) => {
  const deliveredOrder = await OrderService.updateOrderStatusIntoDB(
    String(req.params.id),
    ORDER_STATUS.DELIVERED,
  );

  if (!deliveredOrder) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Order not found!',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Delivery marked as delivered successfully!',
    data: deliveredOrder,
  });
});

// 6. updateBagCount
const updateBagCount = asyncHandler(async (req, res) => {
  const result = await OrderService.updateBagCountIntoDB(
    String(req.params.id),
    req.body.kind,
    Number(req.body.count),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Bag count updated successfully!',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getOrderById,
  assignDriverToOrder,
  updateOrderStatus,
  updateBagCount,
  completeDeliveryAndCapturePayment,
};
