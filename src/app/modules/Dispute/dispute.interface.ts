import { Document, Types } from 'mongoose';

export type TDisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface IDispute extends Document {
  order: Types.ObjectId;
  raisedBy: Types.ObjectId;
  type?: string;
  description: string;
  attachments?: string[];
  status: TDisputeStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
