import { Document, Types } from 'mongoose';

export type TNotificationType =
  | 'ORDER_STATUS'
  | 'REMINDER'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'CHAT';

export interface INotification extends Document {
  user: Types.ObjectId;
  type: TNotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
