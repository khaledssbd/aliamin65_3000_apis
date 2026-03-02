import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AddressController } from './address.controller';
import { AddressValidation } from './address.validation';

const router = Router();

router.get('/', auth(ROLE.CUSTOMER, ROLE.DRIVER), AddressController.listMine);

router.post(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  validateRequest(AddressValidation.create),
  AddressController.create,
);

router.patch(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  validateRequest(AddressValidation.update),
  AddressController.update,
);

router.delete(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.remove,
);

router.patch(
  '/:id/default',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.setDefault,
);

export const AddressRoutes = router;
