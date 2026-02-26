import { Document, Types } from 'mongoose';

export type TPayoutStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface IEarning extends Document {
  driver: Types.ObjectId;
  order: Types.ObjectId;
  amountGross: number;
  amountDriver: number;
  amountPlatform: number;
  payoutStatus: TPayoutStatus;
  payoutAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
