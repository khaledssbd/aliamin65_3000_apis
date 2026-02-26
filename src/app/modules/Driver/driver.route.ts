import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DriverController } from './driver.controller';
import { DriverValidation } from './driver.validation';

const router = Router();

router.post(
  '/onboarding',
  auth(ROLE.DRIVER),
  validateRequest(DriverValidation.onboarding),
  DriverController.onboarding,
);
router.post(
  '/insurance',
  auth(ROLE.DRIVER),
  validateRequest(DriverValidation.insurance),
  DriverController.insurance,
);
router.post(
  '/vehicle',
  auth(ROLE.DRIVER),
  validateRequest(DriverValidation.vehicle),
  DriverController.vehicle,
);
router.get('/me', auth(ROLE.DRIVER), DriverController.me);
router.patch(
  '/availability',
  auth(ROLE.DRIVER),
  validateRequest(DriverValidation.availability),
  DriverController.availability,
);

router.get(
  '/jobs/available',
  auth(ROLE.DRIVER),
  DriverController.jobsAvailable,
);
router.post(
  '/jobs/:orderId/accept',
  auth(ROLE.DRIVER),
  DriverController.acceptJob,
);
router.post(
  '/jobs/:orderId/decline',
  auth(ROLE.DRIVER),
  DriverController.declineJob,
);
router.post(
  '/jobs/:orderId/cancel',
  auth(ROLE.DRIVER),
  DriverController.cancelJob,
);

export const DriverRoutes = router;
