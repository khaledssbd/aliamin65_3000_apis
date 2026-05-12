import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DispatchController } from './dispatch.controller';

const router = Router();

// 1. createDispatch
router.post('/', auth(ROLE.DRIVER), DispatchController.createDispatch);

// 2. reassignDispatch
router.patch(
  '/:id/assign',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.reassignDispatch,
);

// 3. updateDispatchSequence
router.patch(
  '/:id/sequence',
  auth(ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.updateDispatchSequence,
);

// 4. updateDispatchStatus
router.patch(
  '/:id/status',
  auth(ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.updateDispatchStatus,
);

// 5. getDriverDispatches
router.get(
  '/driver/me',
  auth(ROLE.DRIVER),
  DispatchController.getDriverDispatches,
);

// 6. getDispatch
router.get(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.DRIVER),
  DispatchController.getDispatch,
);

export const DispatchRoutes = router;
