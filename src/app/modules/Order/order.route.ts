import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';

const router = Router();

router.post(
  '/',
  auth(ROLE.CUSTOMER),
  validateRequest(OrderValidation.create),
  OrderController.create,
);

router.get('/', auth(ROLE.CUSTOMER), OrderController.listMine);

router.get(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  OrderController.getById,
);

router.patch(
  '/:id/assign-driver',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(OrderValidation.assignDriver),
  OrderController.assignDriver,
);

router.patch(
  '/:id/status',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(OrderValidation.status),
  OrderController.updateStatus,
);

router.patch(
  '/:id/bag-count/pickup',
  auth(ROLE.DRIVER),
  validateRequest(OrderValidation.bagCount),
  OrderController.setPickupBagCount,
);

router.patch(
  '/:id/bag-count/delivery',
  auth(ROLE.DRIVER),
  validateRequest(OrderValidation.bagCount),
  OrderController.setDeliveryBagCount,
);

router.post(
  '/:id/ready-time',
  auth(ROLE.DRIVER),
  validateRequest(OrderValidation.readyTime),
  OrderController.setReadyTime,
);

export const OrderRoutes = router;
