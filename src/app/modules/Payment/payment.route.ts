import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PaymentController } from './payment.controller';

const router = Router();

// 1. createPaymentIntentForMyOrder
router.post(
  '/intent',
  auth(ROLE.CUSTOMER),
  PaymentController.createPaymentIntentForMyOrder,
);

// 2. capturePaymentForMyOrder
router.post(
  '/confirm',
  auth(ROLE.CUSTOMER),
  PaymentController.capturePaymentForMyOrder,
);

// 3. getPaymentByOrderId
router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PaymentController.getPaymentByOrderId,
);

export const PaymentRoutes = router;
