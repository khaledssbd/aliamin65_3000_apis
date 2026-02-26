import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { NotificationController } from './notification.controller';

const router = Router();

router.get(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  NotificationController.listMine,
);
router.patch(
  '/:id/read',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  NotificationController.markRead,
);
router.patch(
  '/read-all',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  NotificationController.markAllRead,
);
router.delete(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  NotificationController.remove,
);

export const NotificationRoutes = router;
