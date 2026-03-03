import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { BackgroundCheckController } from './backgroundCheck.controller';

const router = Router();

// 1. checkDriverBackgroundStatus
router.post(
  '/sync-status/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  BackgroundCheckController.checkDriverBackgroundStatus,
);

// 2. getDriverBackgroundDataByHisDriverId
router.get(
  '/driver/:driverId',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.DRIVER),
  BackgroundCheckController.getDriverBackgroundDataByHisDriverId,
);

// 3. getDriverBackgroundDataByHisUserId
router.get(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  BackgroundCheckController.getDriverBackgroundDataByHisUserId,
);

export const BackgroundCheckRoutes = router;
