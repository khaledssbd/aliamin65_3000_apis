import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { InvoiceController } from './invoice.controller';

const router = Router();

router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  InvoiceController.getByOrder,
);

router.get(
  '/:invoiceNumber',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  InvoiceController.getByNumber,
);

router.post(
  '/generate/:orderId',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  InvoiceController.generate,
);

export const InvoiceRoutes = router;
