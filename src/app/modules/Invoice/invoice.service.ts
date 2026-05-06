import InvoiceModel from './invoice.model';
import OrderModel from '../Order/order.model';
import { AppError } from '../../utils';
import httpStatus from 'http-status';

// 1. getInvoiceByOrderIdFromDB
const getInvoiceByOrderIdFromDB = async (orderId: string) => {
  return InvoiceModel.findOne({ order: orderId });
};

// 2. getInvoiceByNumberFromDB
const getInvoiceByNumberFromDB = async (invoiceNumber: string) => {
  return InvoiceModel.findOne({ invoiceNumber });
};

// 3. createInvoiceIntoDB
const createInvoiceIntoDB = async (orderId: string) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found!');
  }

  const invoiceNumber = `INV-${order._id}`;

  const existingInvoice = await InvoiceModel.findOne({ invoiceNumber });
  if (existingInvoice) {
    throw new AppError(httpStatus.CONFLICT, 'Invoice already exists!');
  }

  const lineItems = [
    {
      name: 'Laundry Service',
      amount: order.pricePerBag,
      quantity: order.bags,
    },
  ];
  const total = order.total;

  const doc = await InvoiceModel.findOneAndUpdate(
    { order: order._id },
    {
      order: order._id,
      customer: order.customer,
      invoiceNumber,
      total,
      currency: 'USD',
      lineItems,
      paid: true,
      generatedAt: new Date(),
    },
    { upsert: true, returnDocument: 'after' },
  );

  return doc;
};

export const InvoiceService = {
  getInvoiceByOrderIdFromDB,
  getInvoiceByNumberFromDB,
  createInvoiceIntoDB,
};
