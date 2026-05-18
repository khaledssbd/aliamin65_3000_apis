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
const createInvoiceIntoDB = async (orderId: string, totalOverride?: number) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found!');
  }

  const invoiceNumber = `INV-${order._id}`;

  const existingInvoice = await InvoiceModel.findOne({ invoiceNumber });
  if (existingInvoice) {
    return existingInvoice;
  }

  const bagCount = Math.max(0, order.bagCountAtDelivery ?? order.bagCountAtPickup ?? order.bags ?? 0);
  const baseTotal = bagCount * order.pricePerBag;
  const total = totalOverride ?? baseTotal;
  const tipAmount = Math.max(0, total - baseTotal);

  const lineItems = [
    {
      name: 'Laundry Service',
      amount: order.pricePerBag,
      quantity: bagCount,
    },
    ...(tipAmount
      ? [
          {
            name: 'Tip',
            amount: tipAmount,
            quantity: 1,
          },
        ]
      : []),
  ];

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
