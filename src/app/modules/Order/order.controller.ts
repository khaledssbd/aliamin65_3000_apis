import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { OrderService } from './order.service';
import { getIO } from '../../socket';
import DriverModel from '../Driver/driver.model';
import UserModel from '../User/user.model';

// 1. create
const create = asyncHandler(async (req, res) => {
  const result = await OrderService.createInDB(req.user._id, req.body);

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

// 2. listMine
const listMine = asyncHandler(async (req, res) => {
  const result = await OrderService.listMineInDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Orders retrieved successfully!',
    data: result,
  });
});

// 3. getById
const getById = asyncHandler(async (req, res) => {
  const result = await OrderService.getByIdInDB(
    String(req.params.id),
    req.user._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order details retrieved successfully!',
    data: result,
  });
});

// 4. assignDriver
const assignDriver = asyncHandler(async (req, res) => {
  const result = await OrderService.assignDriverInDB(
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

// 5. updateStatus
const updateStatus = asyncHandler(async (req, res) => {
  const result = await OrderService.updateStatusInDB(
    String(req.params.id),
    req.body.status,
  );
  getIO()?.emit('order:status', {
    orderId: result?._id,
    status: req.body.status,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Status updated successfully!',
    data: result,
  });
});

// 6. setPickupBagCount
const setPickupBagCount = asyncHandler(async (req, res) => {
  const result = await OrderService.setBagCountInDB(
    String(req.params.id),
    'pickup',
    req.body.bagCount,
  );
  getIO()?.emit('order:bagcount', {
    orderId: result?._id,
    type: 'pickup',
    bagCount: req.body.bagCount,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pickup bag count set successfully!',
    data: result,
  });
});

// 7. setDeliveryBagCount
const setDeliveryBagCount = asyncHandler(async (req, res) => {
  const result = await OrderService.setBagCountInDB(
    String(req.params.id),
    'delivery',
    req.body.bagCount,
  );
  getIO()?.emit('order:bagcount', {
    orderId: result?._id,
    type: 'delivery',
    bagCount: req.body.bagCount,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Delivery bag count set successfully!',
    data: result,
  });
});

// 8. setReadyTime
const setReadyTime = asyncHandler(async (req, res) => {
  const result = await OrderService.setReadyTimeInDB(
    String(req.params.id),
    req.body.isoTime,
  );
  getIO()?.emit('order:readytime', {
    orderId: result?._id,
    isoTime: req.body.isoTime,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ready time set successfully!',
    data: result,
  });
});

export const OrderController = {
  create,
  listMine,
  getById,
  assignDriver,
  updateStatus,
  setPickupBagCount,
  setDeliveryBagCount,
  setReadyTime,
};
