import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { EarningController } from './earning.controller';

const router = Router();

// 1. getEarnings
router.get('/driver/me', auth(ROLE.DRIVER), EarningController.getEarnings);

// 2. getEarning
router.get(
  '/driver/me/:orderId',
  auth(ROLE.DRIVER),
  EarningController.getEarning,
);

// 3. getTodayEarningsSummary
router.get(
  '/driver/summary/today',
  auth(ROLE.DRIVER),
  EarningController.getTodayEarningsSummary,
);

export const EarningRoutes = router;
