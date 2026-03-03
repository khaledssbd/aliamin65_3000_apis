import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { CardController } from './card.controller';
import { CardValidation } from './card.validation';

const router = Router();

// 1. listMySavedCards
router.get('/', auth(ROLE.CUSTOMER), CardController.listMySavedCards);

// 2. attachNewCardToMyAccount
router.post(
  '/attach',
  auth(ROLE.CUSTOMER),
  validateRequest(CardValidation.attachSchema),
  CardController.attachNewCardToMyAccount,
);

// 3. setMyDefaultCard
router.patch(
  '/:id/default',
  auth(ROLE.CUSTOMER),
  validateRequest(CardValidation.idParamSchema),
  CardController.setMyDefaultCard,
);

// 4. detachMyCard
router.delete('/:id', auth(ROLE.CUSTOMER), CardController.detachMyCard);

export const CardRoutes = router;
