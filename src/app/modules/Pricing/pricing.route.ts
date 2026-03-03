import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PricingController } from './pricing.controller';
import { PricingValidation } from './pricing.validation';

const router = Router();

// 1. getActivePricing
router.get('/active', PricingController.getActivePricing);

// 2. createPricing
router.post(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(PricingValidation.createPricingSchema),
  PricingController.createPricing,
);

// 3. activatePricing
router.patch(
  '/:id/activate',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  PricingController.activatePricing,
);

export const PricingRoutes = router;
