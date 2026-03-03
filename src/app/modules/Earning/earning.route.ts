import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { EarningController } from './earning.controller';

const router = Router();

// 1. listMyEarnings
router.get('/driver/me', auth(ROLE.DRIVER), EarningController.listMyEarnings);

// 2. getMyEarningByOrderId
router.get(
  '/driver/me/:orderId',
  auth(ROLE.DRIVER),
  EarningController.getMyEarningByOrderId,
);

// 3. getMyEarningsSummaryForToday
router.get(
  '/driver/summary/today',
  auth(ROLE.DRIVER),
  EarningController.getMyEarningsSummaryForToday,
);

export const EarningRoutes = router;
