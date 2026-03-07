import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { OrderService } from './order.service';
import { getIO } from '../../socket';
import DriverModel from '../Driver/driver.model';
import UserModel from '../User/user.model';

// 1. createOrder
const createOrder = asyncHandler(async (req, res) => {
  const result = await OrderService.createOrderIntoDB(req.user, req.body);

  const ordersNs = getIO()?.of('/orders');

  ordersNs?.to(`customer:${String(req.user._id)}`).emit('order:created', {
    orderId: result._id,
  });

  const customer = await UserModel.findById(req.user._id).select('address');
  const customerAddress = String(customer?.address ?? '').trim();

  const availableDrivers = await DriverModel.find({ isAvailable: true })
    .populate('user', 'address')
    .select('user');

  const matched = customerAddress
    ? availableDrivers.filter((d) => {
        const populated = d.user as unknown;
        const addr =
          populated &&
          typeof populated === 'object' &&
          'address' in populated &&
          typeof (populated as { address?: unknown }).address === 'string'
            ? String((populated as { address?: string }).address).trim()
            : '';
        return addr && addr === customerAddress;
      })
    : [];

  const targets = matched.length ? matched : availableDrivers;
  targets.forEach((d) => {
    ordersNs?.to(`driver:${String(d.user)}`).emit('driver:job:new', {
      orderId: result._id,
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
};
