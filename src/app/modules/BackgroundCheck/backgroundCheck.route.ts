import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { BackgroundCheckController } from './backgroundCheck.controller';

const router = Router();

router.post(
  '/sync-status/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  BackgroundCheckController.checkDriverBackgroundStatus,
);

router.get(
  '/driver/:driverId',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.DRIVER),
  BackgroundCheckController.byDriver,
);

router.get(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  BackgroundCheckController.getById,
);

export const BackgroundCheckRoutes = router;
