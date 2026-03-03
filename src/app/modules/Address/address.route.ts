import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AddressController } from './address.controller';
import { AddressValidation } from './address.validation';

const router = Router();

// 1. listMineAddress
router.get(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.listMineAddress,
);

// 2. createAddress
router.post(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  validateRequest(AddressValidation.createSchema),
  AddressController.createAddress,
);

// 3. updateAddress
router.patch(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  validateRequest(AddressValidation.updateSchema),
  AddressController.updateAddress,
);

// 4. removeAddress
router.delete(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.removeAddress,
);

// 5. setDefaultAddress
router.patch(
  '/:id/default',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.setDefaultAddress,
);

export const AddressRoutes = router;
