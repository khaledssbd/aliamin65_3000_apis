import InvoiceModel from './invoice.model';
import OrderModel from '../Order/order.model';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';

// 1. getInvoiceByOrderIdFromDB
const getInvoiceByOrderIdFromDB = async (orderId: string) => {
  return InvoiceModel.findOne({ order: orderId });
};

// 2. getInvoiceByNumberFromDB
const getInvoiceByNumberFromDB = async (invoiceNumber: string) => {
  return InvoiceModel.findOne({ invoiceNumber });
};

const getAuthorizedInvoiceByOrderIdFromDB = async (
  orderId: string,
  userId: string,
  role?: string,
) => {
  const invoice = await InvoiceModel.findOne({ order: orderId });

  if (!invoice) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invoice not found!');
  }

  const order = await OrderModel.findById(orderId).select('customer driver');
  const canAccess =
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    String(order?.customer) === userId ||
    String(order?.driver) === userId;

  if (!canAccess) {
    throw new AppError(httpStatus.FORBIDDEN, 'You cannot access this invoice.');
  }

  return invoice;
};

const createInvoiceDownloadToken = (orderId: string, userId: string) => {
  return jwt.sign(
    {
      orderId,
      userId,
      purpose: 'invoice-download',
    },
    config.jwt.access_secret!,
    { expiresIn: '10m' },
  );
};

const getInvoiceFromDownloadToken = async (token: string) => {
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, config.jwt.access_secret!) as JwtPayload;
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invoice link expired.');
  }

  if (decoded.purpose !== 'invoice-download' || !decoded.orderId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid invoice link.');
  }

  const invoice = await InvoiceModel.findOne({ order: decoded.orderId })
    .populate('customer', 'name email phone address')
    .populate('order');

  if (!invoice) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invoice not found!');
  }

  return invoice;
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
  getAuthorizedInvoiceByOrderIdFromDB,
  createInvoiceDownloadToken,
  getInvoiceFromDownloadToken,
  createInvoiceIntoDB,
};
