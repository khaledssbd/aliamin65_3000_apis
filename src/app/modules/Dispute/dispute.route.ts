import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DisputeController } from './dispute.controller';

const router = Router();

router.post('/', auth(ROLE.CUSTOMER, ROLE.DRIVER), DisputeController.create);
router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DisputeController.byOrder,
);
router.patch(
  '/:id/status',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DisputeController.updateStatus,
);
router.patch(
  '/:id/notes',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DisputeController.setNotes,
);

export const DisputeRoutes = router;
