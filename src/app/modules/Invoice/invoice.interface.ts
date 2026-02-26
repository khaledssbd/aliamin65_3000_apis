import { Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  order: Types.ObjectId;
  customer: Types.ObjectId;
  invoiceNumber: string;
  total: number;
  currency: string;
  lineItems?: Array<{ name: string; amount: number; quantity: number }>;
  paid: boolean;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
