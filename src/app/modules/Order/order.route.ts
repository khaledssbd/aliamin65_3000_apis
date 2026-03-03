import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';

const router = Router();

// 1. createOrder
router.post(
  '/',
  auth(ROLE.CUSTOMER),
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder,
);

// 2. getMyOrders
router.get('/', auth(ROLE.CUSTOMER), OrderController.getMyOrders);

// 3. getOrderById
router.get(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  OrderController.getOrderById,
);

// 4. assignDriverToOrder
router.patch(
  '/:id/assign-driver',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(OrderValidation.assignDriverToOrderSchema),
  OrderController.assignDriverToOrder,
);

// 5. updateOrderStatus
router.patch(
  '/:id/status',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(OrderValidation.updateOrderStatusSchema),
  OrderController.updateOrderStatus,
);

// 6. setPickupBagCount
router.patch(
  '/:id/bag-count/pickup',
  auth(ROLE.DRIVER),
  validateRequest(OrderValidation.setBagCountSchema),
  OrderController.updateBagCount,
);

// 7. setDeliveryBagCount
router.patch(
  '/:id/bag-count/delivery',
  auth(ROLE.DRIVER),
  validateRequest(OrderValidation.setBagCountSchema),
  OrderController.updateBagCount,
);

// 8. setOrderReadyTime
router.post(
  '/:id/ready-time',
  auth(ROLE.DRIVER),
  validateRequest(OrderValidation.setOrderReadyTimeSchema),
  OrderController.updateOrderStatus,
);

export const OrderRoutes = router;
