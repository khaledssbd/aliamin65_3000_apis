import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { OrderService } from './order.service';
import { getIO } from '../../socket';
import AddressModel from '../Address/address.model';
import DriverModel from '../Driver/driver.model';

const create = asyncHandler(async (req, res) => {
  const result = await OrderService.create(req.user._id, req.body);

  const ordersNs = getIO()?.of('/orders');
  ordersNs?.to(`customer:${String(req.user._id)}`).emit('order:created', {
    orderId: result._id,
  });

  const pickupAddress = await AddressModel.findById(result.pickupAddress);
  const coords = pickupAddress?.location?.coordinates;
  if (coords && coords.length === 2) {
    const nearbyDrivers = await DriverModel.find({
      isAvailable: true,
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: 5000,
        },
      },
    }).select('user');

    nearbyDrivers.forEach((d) => {
      ordersNs?.to(`driver:${String(d.user)}`).emit('driver:job:new', {
        orderId: result._id,
      });
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Order created',
    data: result,
  });
});

const listMine = asyncHandler(async (req, res) => {
  const result = await OrderService.listMine(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Orders retrieved',
    data: result,
  });
});

const getById = asyncHandler(async (req, res) => {
  const result = await OrderService.getById(
    String(req.params.id),
    req.user._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order details',
    data: result,
  });
});

const assignDriver = asyncHandler(async (req, res) => {
  const result = await OrderService.assignDriver(
    String(req.params.id),
    req.body.driverId,
  );
  getIO()?.emit('order:assigned', {
    orderId: result?._id,
    driverId: result?.driver,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver assigned',
    data: result,
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const result = await OrderService.updateStatus(
    String(req.params.id),
    req.body.status,
  );
  getIO()?.emit('order:status', {
    orderId: result?._id,
    status: req.body.status,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Status updated',
    data: result,
  });
});

const setPickupBagCount = asyncHandler(async (req, res) => {
  const result = await OrderService.setBagCount(
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
    message: 'Pickup bag count set',
    data: result,
  });
});

const setDeliveryBagCount = asyncHandler(async (req, res) => {
  const result = await OrderService.setBagCount(
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
    message: 'Delivery bag count set',
    data: result,
  });
});

const setReadyTime = asyncHandler(async (req, res) => {
  const result = await OrderService.setReadyTime(
    String(req.params.id),
    req.body.isoTime,
  );
  getIO()?.emit('order:readytime', {
    orderId: result?._id,
    isoTime: req.body.isoTime,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ready time set',
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
