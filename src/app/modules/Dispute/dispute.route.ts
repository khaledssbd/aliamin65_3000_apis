import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DisputeController } from './dispute.controller';

const router = Router();

// 1. createDisputeForOrder
router.post(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  DisputeController.createDisputeForOrder,
);

// 2. getDisputesByOrderId
router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DisputeController.getDisputesByOrderId,
);

// 3. updateDisputeStatus
router.patch(
  '/:id/status',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DisputeController.updateDisputeStatus,
);

// 4. setDisputeAdminNotes
router.patch(
  '/:id/notes',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DisputeController.setDisputeAdminNotes,
);

export const DisputeRoutes = router;
