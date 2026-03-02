import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { EarningController } from './earning.controller';

const router = Router();

router.get('/driver/me', auth(ROLE.DRIVER), EarningController.driverMe);

router.get(
  '/driver/me/:orderId',
  auth(ROLE.DRIVER),
  EarningController.driverByOrder,
);

router.get(
  '/driver/summary/today',
  auth(ROLE.DRIVER),
  EarningController.driverSummaryToday,
);

export const EarningRoutes = router;
