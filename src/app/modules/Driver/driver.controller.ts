import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DriverService } from './driver.service';
import { getIO } from '../../socket';
import OrderModel from '../Order/order.model';
import DriverModel from './driver.model';

// 1. onboarding
const onboarding = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertMineInDB(req.user._id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Onboarding saved',
    data: result,
  });
});

// 2. insurance
const insurance = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertMineInDB(req.user._id, {
    insurance: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Insurance updated',
    data: result,
  });
});

// 3. vehicle
const vehicle = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertMineInDB(req.user._id, {
    vehicle: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vehicle updated',
    data: result,
  });
});

// 4. me
const me = asyncHandler(async (req, res) => {
  const result = await DriverService.meInDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile',
    data: result,
  });
});

// 5. availability
const availability = asyncHandler(async (req, res) => {
  const result = await DriverService.setAvailabilityInDB(
    req.user._id,
    req.body.isAvailable,
  );
  getIO()?.emit('driver:availability:updated', {
    isAvailable: req.body.isAvailable,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Availability updated',
    data: result,
  });
});

// 6. jobsAvailable
const jobsAvailable = asyncHandler(async (req, res) => {
  const result = await DriverService.jobsAvailableInDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Jobs available',
    data: result,
  });
});

// 7. acceptJob
const acceptJob = asyncHandler(async (req, res) => {
  const result = await DriverService.acceptJobInDB(
    req.user._id,
    String(req.params.orderId),
  );

  const ordersNs = getIO()?.of('/orders');
  if (result) {
    const order = await OrderModel.findById(String(req.params.orderId)).select(
      'customer',
    );
    if (order) {
      ordersNs
        ?.to(`customer:${String(order.customer)}`)
        .emit('order:driver:accepted', {
          orderId: req.params.orderId,
          driverUserId: String(req.user._id),
        });
    }

    const availableDrivers = await DriverModel.find({
      isAvailable: true,
    }).select('user');

    availableDrivers
      .map((d) => String(d.user))
      .filter((id) => id !== String(req.user._id))
      .forEach((id) => {
        ordersNs?.to(`driver:${id}`).emit('order:hidden', {
          orderId: req.params.orderId,
        });
      });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job accepted',
    data: result,
  });
});

// 8. declineJob
const declineJob = asyncHandler(async (req, res) => {
  const result = await DriverService.declineJobInDB(
    req.user._id,
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job declined',
    data: result,
  });
});

// 9. cancelJob
const cancelJob = asyncHandler(async (req, res) => {
  const result = await DriverService.cancelJobInDB(
    req.user._id,
    String(req.params.orderId),
    req.body?.reason,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job canceled',
    data: result,
  });
});

export const DriverController = {
  onboarding,
  insurance,
  vehicle,
  me,
  availability,
  jobsAvailable,
  acceptJob,
  declineJob,
  cancelJob,
};
