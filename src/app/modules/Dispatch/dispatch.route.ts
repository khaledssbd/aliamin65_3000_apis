import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DispatchController } from './dispatch.controller';

const router = Router();

// 1. createDispatchBatch
router.post(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.createDispatchBatch,
);

// 2. reassignDispatchBatchDriver
router.patch(
  '/:id/assign',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.reassignDispatchBatchDriver,
);

// 3. updateDispatchBatchSequence
router.patch(
  '/:id/sequence',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.updateDispatchBatchSequence,
);

// 4. updateDispatchBatchStatus
router.patch(
  '/:id/status',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.updateDispatchBatchStatus,
);

// 5. listMyAssignedDispatchBatches
router.get(
  '/driver/me',
  auth(ROLE.DRIVER),
  DispatchController.listMyAssignedDispatchBatches,
);

// 6. getDispatchBatchById
router.get(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.DRIVER),
  DispatchController.getDispatchBatchById,
);

export const DispatchRoutes = router;
