import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AddressController } from './address.controller';
import { AddressValidation } from './address.validation';

const router = Router();

// listMineAddress
router.get(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.listMineAddress,
);

// createAddress
router.post(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  validateRequest(AddressValidation.createSchema),
  AddressController.createAddress,
);

// updateAddress
router.patch(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  validateRequest(AddressValidation.updateSchema),
  AddressController.updateAddress,
);

// removeAddress
router.delete(
  '/:id',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.removeAddress,
);

// setDefaultAddress
router.patch(
  '/:id/default',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.setDefaultAddress,
);

export const AddressRoutes = router;
