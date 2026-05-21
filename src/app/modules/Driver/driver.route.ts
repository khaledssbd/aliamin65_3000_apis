import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DriverController } from './driver.controller';
import { DriverValidation } from './driver.validation';

const router = Router();

// 1. onboardDriver
router.post(
  '/onboarding',
  auth(ROLE.DRIVER),
  validateRequest(DriverValidation.onboardingSchema),
  DriverController.onboardDriver,
);

// 2. updateDriverInsurance
router.post(
  '/insurance',
  auth(ROLE.DRIVER),
  validateRequest(DriverValidation.insuranceSchema),
  DriverController.updateDriverInsurance,
);

// 3. updateDriverVehicle
router.post(
  '/vehicle',
  auth(ROLE.DRIVER),
  validateRequest(DriverValidation.vehicleSchema),
  DriverController.updateDriverVehicle,
);

// 4. getMyDriverProfile
router.get('/me', auth(ROLE.DRIVER), DriverController.getMyDriverProfile);

router.post(
  '/stripe/connect-account',
  auth(ROLE.DRIVER),
  DriverController.createStripeConnectAccountLink,
);

router.get('/stripe/connect-return', DriverController.stripeConnectReturn);

router.get(
  '/stripe/connect-status',
  auth(ROLE.DRIVER),
  DriverController.getStripeConnectStatus,
);

// 5. updateDriverAvailability
router.patch(
  '/availability',
  auth(ROLE.DRIVER),
  validateRequest(DriverValidation.availabilitySchema),
  DriverController.updateDriverAvailability,
);

// 6. getAvailableJobsForDriver
router.get(
  '/jobs/available',
  auth(ROLE.DRIVER),
  DriverController.getAvailableJobsForDriver,
);

router.get('/jobs/my', auth(ROLE.DRIVER), DriverController.getMyJobsForDriver);

// 7. acceptJobByDriver
router.post(
  '/jobs/:orderId/accept',
  auth(ROLE.DRIVER),
  DriverController.acceptJobByDriver,
);

// 8. declineJobByDriver
router.post(
  '/jobs/:orderId/decline',
  auth(ROLE.DRIVER),
  DriverController.declineJobByDriver,
);

// 9. cancelJobByDriver
router.post(
  '/jobs/:orderId/cancel',
  auth(ROLE.DRIVER),
  DriverController.cancelJobByDriver,
);

router.patch(
  '/jobs/:orderId/stage',
  auth(ROLE.DRIVER),
  DriverController.updateJobStageByDriver,
);

export const DriverRoutes = router;
