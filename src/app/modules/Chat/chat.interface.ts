import { Document, Types } from 'mongoose';

export type TChatContentType = 'TEXT' | 'IMAGE' | 'AUDIO';

export interface IChatMessage extends Document {
  order?: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  contentType: TChatContentType;
  content: string;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
