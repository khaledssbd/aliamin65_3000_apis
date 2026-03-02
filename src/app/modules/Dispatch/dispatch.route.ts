import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { DispatchController } from './dispatch.controller';

const router = Router();

router.post('/', auth(ROLE.ADMIN, ROLE.SUPER_ADMIN), DispatchController.create);

router.patch(
  '/:id/assign',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.assign,
);

router.patch(
  '/:id/sequence',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.sequence,
);

router.patch(
  '/:id/status',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  DispatchController.status,
);

router.get('/driver/me', auth(ROLE.DRIVER), DispatchController.driverMe);

router.get(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.DRIVER),
  DispatchController.getById,
);

export const DispatchRoutes = router;
