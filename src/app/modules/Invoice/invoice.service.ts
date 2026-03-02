import InvoiceModel from './invoice.model';
import OrderModel from '../Order/order.model';

const getByOrder = async (orderId: string) => {
  return InvoiceModel.findOne({ order: orderId });
};

const getByNumber = async (invoiceNumber: string) => {
  return InvoiceModel.findOne({ invoiceNumber });
};

const generate = async (orderId: string) => {
  const order = await OrderModel.findById(orderId);
  if (!order) return null;
  const invoiceNumber = `INV-${order._id}`;
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
    { upsert: true, new: true },
  );
  return doc;
};

export const InvoiceService = {
  getByOrder,
  getByNumber,
  generate,
};
