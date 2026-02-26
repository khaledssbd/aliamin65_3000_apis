import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PricingController } from './pricing.controller';
import { PricingValidation } from './pricing.validation';

const router = Router();

router.get('/active', PricingController.getActive);
router.post(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(PricingValidation.create),
  PricingController.create,
);
router.patch(
  '/:id/activate',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PricingController.activate,
);

export const PricingRoutes = router;
