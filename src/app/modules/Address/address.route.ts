import { Router } from 'express';
import { auth, validateRequest } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { AddressController } from './address.controller';
import { AddressValidation } from './address.validation';

const router = Router();

// 1. getMyAddress
router.get(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.getMyAddress,
);

// 2. createAddress
router.post(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  validateRequest(AddressValidation.createAddressValidationSchema),
  AddressController.createAddress,
);

// 3. updateAddress
router.patch(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  validateRequest(AddressValidation.updateAddressValidationSchema),
  AddressController.updateAddress,
);

// 4. deleteAddress
router.delete(
  '/',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.deleteAddress,
);

// 5. setDefaultAddress
router.patch(
  '/default',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  AddressController.setDefaultAddress,
);

export const AddressRoutes = router;
