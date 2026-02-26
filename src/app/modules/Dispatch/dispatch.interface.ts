import { Document, Types } from 'mongoose';

export type TDispatchStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED';

export interface IDispatch extends Document {
  driver: Types.ObjectId;
  orders: Types.ObjectId[];
  zone?: Types.ObjectId;
  timeWindowStart?: Date;
  timeWindowEnd?: Date;
  sequence?: Types.ObjectId[];
  status: TDispatchStatus;
  createdAt: Date;
  updatedAt: Date;
}
