import httpStatus from 'http-status';
import { Request } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { DriverService } from './driver.service';
import { getIO } from '../../socket';
import DriverModel from './driver.model';

const isAppDeepLink = (value?: string) => {
  if (!value) return false;

  try {
    const protocol = new URL(value).protocol;
    return protocol === 'sudsygo:' || protocol === 'exp:';
  } catch {
    return false;
  }
};

const getBackendBaseUrl = (req: Request) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string'
      ? forwardedProto.split(',')[0]
      : req.protocol;
  return `${protocol}://${req.get('host')}`;
};

const toStripeConnectBridgeUrl = (req: Request, value?: string) => {
  if (!isAppDeepLink(value)) return value;

  const url = new URL(
    '/api/v1/drivers/stripe/connect-return',
    getBackendBaseUrl(req),
  );
  url.searchParams.set('appReturnUrl', value as string);
  return url.toString();
};

const emitOrderToAvailableDrivers = async (
  order: {
    _id?: unknown;
    address?: string;
    serviceType?: string;
    pickupLocation?: unknown;
    pickupType?: string;
    scheduledPickupAt?: Date;
    bags?: number;
    expectedRadiusKm?: number;
    total?: number;
    status?: string;
    createdAt?: Date;
  },
  // excludeDriverUserId?: string,
) => {
  const ordersNs = getIO()?.of('/orders');
  const availableDrivers = await DriverModel.find({ isAvailable: true }).select(
    'user',
  );

  availableDrivers
    .map(driver => String(driver.user))
    // .filter(driverUserId => driverUserId !== excludeDriverUserId)
    .forEach(driverUserId => {
      ordersNs?.to(`driver:${driverUserId}`).emit('driver:job:new', {
        order: {
          orderId: order._id,
          address: order.address,
          serviceType: order.serviceType,
          pickupLocation: order.pickupLocation,
          pickupType: order.pickupType,
          scheduledPickupAt: order.scheduledPickupAt,
          bags: order.bags,
          expectedRadiusKm: order.expectedRadiusKm,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        },
      });
    });
};

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
  const returnUrl =
    typeof req.body?.returnUrl === 'string'
      ? req.body.returnUrl
      : typeof req.query?.returnUrl === 'string'
        ? req.query.returnUrl
        : undefined;
  const refreshUrl =
    typeof req.body?.refreshUrl === 'string'
      ? req.body.refreshUrl
      : typeof req.query?.refreshUrl === 'string'
        ? req.query.refreshUrl
        : undefined;

  const result = await DriverService.createStripeConnectAccountLinkIntoDB(
    req.user._id,
    {
      returnUrl: toStripeConnectBridgeUrl(req, returnUrl),
      refreshUrl: toStripeConnectBridgeUrl(req, refreshUrl),
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Stripe onboarding link created successfully!',
    data: result,
  });
});

const stripeConnectReturn = asyncHandler(async (req, res) => {
  const appReturnUrl =
    typeof req.query?.appReturnUrl === 'string'
      ? req.query.appReturnUrl
      : undefined;

  if (!appReturnUrl) {
    res
      .status(httpStatus.BAD_REQUEST)
      .send('Missing app return URL. Please return to the sudsygo app.');
    return;
  }

  res.status(httpStatus.OK).type('html').send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Returning to sudsygo</title>
  </head>
  <body style="font-family:Arial,sans-serif;text-align:center;padding:48px 20px;">
    <h2>Returning to sudsygo...</h2>
    <p>If the app does not open automatically, please return to the sudsygo app.</p>
    <script>
      window.location.replace(${JSON.stringify(appReturnUrl)});
    </script>
  </body>
</html>`);
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

    ordersNs?.to(`customer:${customerId}`).emit('order:assignment:released', {
      orderId: req.params.orderId,
      status: order.status,
      canceledBy: String(req.user._id),
      canceledByRole: req.user.role,
    });
    ordersNs
      ?.to(`driver:${String(req.user._id)}`)
      .emit('order:assignment:released', {
        orderId: req.params.orderId,
        status: order.status,
        canceledBy: String(req.user._id),
        canceledByRole: req.user.role,
      });
    ordersNs
      ?.to(`order:${req.params.orderId}`)
      .emit('order:assignment:released', {
        orderId: req.params.orderId,
        status: order.status,
        canceledBy: String(req.user._id),
        canceledByRole: req.user.role,
      });

    await emitOrderToAvailableDrivers(
      order, // result?.releasedDriverId
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order assignment canceled and sent back to drivers!',
    data: order,
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
    const payload = {
      orderId: req.params.orderId,
      status: result.status,
      stage: req.body.stage,
      order: result,
    };

    ordersNs?.to(`customer:${customerId}`).emit('order:stage:updated', payload);
    ordersNs?.to(`order:${req.params.orderId}`).emit('order:stage:updated', payload);
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
  stripeConnectReturn,
  getStripeConnectStatus,
  updateDriverAvailability,
  getAvailableJobsForDriver,
  getMyJobsForDriver,
  acceptJobByDriver,
  declineJobByDriver,
  cancelJobByDriver,
  updateJobStageByDriver,
};
