import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { CardController } from './card.controller';
import { CardValidation } from './card.validation';

const router = Router();

router.get('/', auth(ROLE.CUSTOMER), CardController.listMine);
router.post(
  '/attach',
  auth(ROLE.CUSTOMER),
  validateRequest(CardValidation.attach),
  CardController.attach,
);
router.patch(
  '/:id/default',
  auth(ROLE.CUSTOMER),
  validateRequest(CardValidation.idParam),
  CardController.setDefault,
);
router.delete('/:id', auth(ROLE.CUSTOMER), CardController.detach);

export const CardRoutes = router;
