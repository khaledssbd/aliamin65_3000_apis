import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { DriverService } from './driver.service';
import { getIO } from '../../socket';
import DriverModel from './driver.model';

// 1. onboardDriver
const onboardDriver = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertDriverProfileIntoDB(
    req.user._id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Onboarding details saved successfully!',
    data: result,
  });
});

// 2. updateDriverInsurance
const updateDriverInsurance = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertDriverProfileIntoDB(req.user._id, {
    insurance: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Insurance details updated successfully!',
    data: result,
  });
});

// 3. updateDriverVehicle
const updateDriverVehicle = asyncHandler(async (req, res) => {
  const result = await DriverService.upsertDriverProfileIntoDB(req.user._id, {
    vehicle: req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Vehicle details updated successfully!',
    data: result,
  });
});

// 4. getMyDriverProfile
const getMyDriverProfile = asyncHandler(async (req, res) => {
  const result = await DriverService.getDriverProfileFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver profile fetched successfully!',
    data: result,
  });
});

const createStripeConnectAccountLink = asyncHandler(async (req, res) => {
  const result = await DriverService.createStripeConnectAccountLinkIntoDB(
    req.user._id,
    {
      returnUrl: req.body?.returnUrl,
      refreshUrl: req.body?.refreshUrl,
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Stripe onboarding link created successfully!',
    data: result,
  });
});

const getStripeConnectStatus = asyncHandler(async (req, res) => {
  const result = await DriverService.getStripeConnectStatusFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Stripe connect status fetched successfully!',
    data: result,
  });
});

// 5. updateDriverAvailability
const updateDriverAvailability = asyncHandler(async (req, res) => {
  const result = await DriverService.setDriverAvailabilityIntoDB(
    req.user._id,
    req.body.isAvailable,
  );

  // getIO()?.emit('driver:availability:updated', {
  //   isAvailable: req.body.isAvailable,
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Availability status updated successfully!',
    data: result,
  });
});

// 6. getAvailableJobsForDriver
const getAvailableJobsForDriver = asyncHandler(async (req, res) => {
  const result = await DriverService.getAvailableJobsForDriverFromDB(
    req.user._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Available jobs fetched successfully!',
    data: result,
  });
});

// getMyJobsForDriver
const getMyJobsForDriver = asyncHandler(async (req, res) => {
  const result = await DriverService.getMyJobsForDriverFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Driver jobs fetched successfully!',
    data: result,
  });
});

// 7. acceptJobByDriver
const acceptJobByDriver = asyncHandler(async (req, res) => {
  const result = await DriverService.acceptJobByDriverIntoDB(
    req.user._id,
    String(req.params.orderId),
  );

  const ordersNs = getIO()?.of('/orders');

  if (result) {
    ordersNs
      ?.to(`customer:${String(result.customer)}`)
      .emit('order:driver:accepted', {
        orderId: req.params.orderId,
        driverUserId: String(req.user._id),
      });

    const availableDrivers = await DriverModel.find({
      isAvailable: true,
    }).select('user');

    availableDrivers
      .map(d => String(d.user))
      .filter(id => id !== String(req.user._id))
      .forEach(id => {
        ordersNs?.to(`driver:${id}`).emit('order:hidden', {
          orderId: req.params.orderId,
        });
      });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job accepted successfully!',
    data: result,
  });
});

// 8. declineJobByDriver
const declineJobByDriver = asyncHandler(async (req, res) => {
  const result = await DriverService.declineJobByDriverIntoDB(
    req.user._id,
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job declined successfully!',
    data: result,
  });
});

// 9. cancelJobByDriver
const cancelJobByDriver = asyncHandler(async (req, res) => {
  const result = await DriverService.cancelJobByDriverIntoDB(
    req.user._id,
    String(req.params.orderId),
    req.body?.reason,
  );

  const ordersNs = getIO()?.of('/orders');
  const order = result?.order;

  if (order) {
    const customerId = String(
      (order.customer as { _id?: unknown })?._id ?? order.customer,
    );

    ordersNs?.to(`customer:${customerId}`).emit('order:canceled', {
      orderId: req.params.orderId,
      status: order.status,
      canceledBy: String(req.user._id),
      canceledByRole: req.user.role,
    });
    ordersNs?.to(`driver:${String(req.user._id)}`).emit('order:canceled', {
      orderId: req.params.orderId,
      status: order.status,
      canceledBy: String(req.user._id),
      canceledByRole: req.user.role,
    });
    ordersNs?.to(`order:${req.params.orderId}`).emit('order:canceled', {
      orderId: req.params.orderId,
      status: order.status,
      canceledBy: String(req.user._id),
      canceledByRole: req.user.role,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order canceled successfully!',
    data: result,
  });
});

const updateJobStageByDriver = asyncHandler(async (req, res) => {
  const result = await DriverService.updateJobStageByDriverIntoDB(
    req.user._id,
    String(req.params.orderId),
    req.body.stage,
    req.body.bagCount,
  );

  const ordersNs = getIO()?.of('/orders');

  if (result) {
    const customerId = String(
      (result.customer as { _id?: unknown })?._id ?? result.customer,
    );

    ordersNs?.to(`customer:${customerId}`).emit('order:stage:updated', {
      orderId: req.params.orderId,
      status: result.status,
      stage: req.body.stage,
    });
    ordersNs?.to(`order:${req.params.orderId}`).emit('order:stage:updated', {
      orderId: req.params.orderId,
      status: result.status,
      stage: req.body.stage,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Job stage updated successfully!',
    data: result,
  });
});

export const DriverController = {
  onboardDriver,
  updateDriverInsurance,
  updateDriverVehicle,
  getMyDriverProfile,
  createStripeConnectAccountLink,
  getStripeConnectStatus,
  updateDriverAvailability,
  getAvailableJobsForDriver,
  getMyJobsForDriver,
  acceptJobByDriver,
  declineJobByDriver,
  cancelJobByDriver,
  updateJobStageByDriver,
};
