import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PaymentController } from './payment.controller';

const router = Router();

router.post('/intent', auth(ROLE.CUSTOMER), PaymentController.createIntent);

router.post(
  '/confirm',
  auth(ROLE.CUSTOMER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PaymentController.confirm,
);

router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PaymentController.byOrder,
);

export const PaymentRoutes = router;
