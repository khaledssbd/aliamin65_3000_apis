import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { RatingController } from './rating.controller';
import { RatingValidation } from './rating.validation';

const router = Router();

router.post(
  '/',
  auth(ROLE.CUSTOMER),
  validateRequest(RatingValidation.create),
  RatingController.create,
);
router.get('/driver/:driverId', RatingController.byDriver);

export const RatingRoutes = router;
