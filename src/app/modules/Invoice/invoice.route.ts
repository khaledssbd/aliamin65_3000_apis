import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { InvoiceController } from './invoice.controller';

const router = Router();

// 1. getInvoiceByOrderId
router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  InvoiceController.getInvoiceByOrderId,
);

// 2. getInvoiceByNumber
router.get(
  '/:invoiceNumber',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  InvoiceController.getInvoiceByNumber,
);

// 3. createInvoice
router.post(
  '/generate/:orderId',
  auth(ROLE.ADMIN, ROLE.SUPER_ADMIN),
  InvoiceController.createInvoice,
);

export const InvoiceRoutes = router;
