import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { PricingController } from './pricing.controller';
import { PricingValidation } from './pricing.validation';

const router = Router();

// 1. getPricing
router.get('/', PricingController.getPricing);

// 2. createOrUpdatePricing
router.put(
  '/',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  validateRequest(PricingValidation.createOrUpdatePricingSchema),
  PricingController.createOrUpdatePricing,
);

export const PricingRoutes = router;
