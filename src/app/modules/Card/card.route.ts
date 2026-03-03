import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { CardController } from './card.controller';
import { CardValidation } from './card.validation';

const router = Router();

// 1. getSavedCards
router.get('/', auth(ROLE.CUSTOMER), CardController.getSavedCards);

// 2. createCard
router.post(
  '/attach',
  auth(ROLE.CUSTOMER),
  validateRequest(CardValidation.attachCardValidationSchema),
  CardController.createCard,
);

// 3. setDefaultCard
router.patch(
  '/:id/default',
  auth(ROLE.CUSTOMER),
  validateRequest(CardValidation.cardIdParamValidationSchema),
  CardController.setDefaultCard,
);

// 4. deleteCard
router.delete('/:id', auth(ROLE.CUSTOMER), CardController.deleteCard);

export const CardRoutes = router;
