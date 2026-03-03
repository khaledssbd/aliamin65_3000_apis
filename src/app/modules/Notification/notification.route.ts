import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { NotificationController } from './notification.controller';

const router = Router();

// 1. getMyNotifications
router.get(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  NotificationController.getMyNotifications,
);

// 2. markMyNotificationAsRead
router.patch(
  '/:id/read',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  NotificationController.markMyNotificationAsRead,
);

// 3. markAllMyNotificationsAsRead
router.patch(
  '/read-all',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  NotificationController.markAllMyNotificationsAsRead,
);

// 4. deleteMyNotification
router.delete(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  NotificationController.deleteMyNotification,
);

export const NotificationRoutes = router;
