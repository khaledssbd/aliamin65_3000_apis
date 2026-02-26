import { Schema, model } from 'mongoose';
import { IInvoice } from './invoice.interface';

const invoiceSchema = new Schema<IInvoice>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    lineItems: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    paid: { type: Boolean, default: false },
    generatedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

const InvoiceModel = model<IInvoice>('Invoice', invoiceSchema);
export default InvoiceModel;
