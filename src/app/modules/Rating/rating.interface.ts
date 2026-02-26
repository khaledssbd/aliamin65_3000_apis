import { Document, Types } from 'mongoose';

export interface IRating extends Document {
  order: Types.ObjectId;
  customer: Types.ObjectId;
  driver: Types.ObjectId;
  rating: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}
