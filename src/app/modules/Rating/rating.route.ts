import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { RatingController } from './rating.controller';
import { RatingValidation } from './rating.validation';

const router = Router();

// 1. createRating
router.post(
  '/',
  auth(ROLE.CUSTOMER),
  validateRequest(RatingValidation.createRatingValidationSchema),
  RatingController.createRating,
);

// 2. getDriverRatings
router.get('/driver/:driverId', RatingController.getDriverRatings);

export const RatingRoutes = router;
