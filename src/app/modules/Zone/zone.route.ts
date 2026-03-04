import { Router } from 'express';
import { ZoneController } from './zone.controller';
import { ZoneValidation } from './zone.validation';
import { validateRequest } from '../../middlewares';
import auth from '../../middlewares/auth';
import { ROLE } from '../User/user.constant';

const router = Router();

// 2. getAllZones
router.get('/', ZoneController.getAllZones);

// 1. createZone
router.post(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(ZoneValidation.createZoneSchema),
  ZoneController.createZone,
);

// 3. updateZone
router.patch(
  '/:id',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(ZoneValidation.updateZoneSchema),
  ZoneController.updateZone,
);

// 4. toggleZoneStatus
router.patch(
  '/:id/toggle',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  ZoneController.toggleZoneStatus,
);

export const ZoneRoutes = router;
