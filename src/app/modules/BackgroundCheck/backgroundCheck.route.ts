import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { BackgroundCheckController } from './backgroundCheck.controller';

const router = Router();

// 1. checkDriverBackgroundStatus (legacy: by backgroundCheckId)
router.post(
  '/sync-status/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  BackgroundCheckController.checkDriverBackgroundStatus,
);

// 2. createBackgroundCheckForDriver
router.post(
  '/driver/:driverId',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  BackgroundCheckController.createBackgroundCheckForDriver,
);

// 3. syncDriverBackgroundStatusByDriverId
router.post(
  '/sync-status/driver/:driverId',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  BackgroundCheckController.syncDriverBackgroundStatusByDriverId,
);

// 4. getDriverBackgroundDataByHisDriverId
router.get(
  '/driver/:driverId',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.DRIVER),
  BackgroundCheckController.getDriverBackgroundDataByHisDriverId,
);

// 5. getDriverBackgroundDataByHisUserId
router.get(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  BackgroundCheckController.getDriverBackgroundDataByHisUserId,
);

export const BackgroundCheckRoutes = router;
