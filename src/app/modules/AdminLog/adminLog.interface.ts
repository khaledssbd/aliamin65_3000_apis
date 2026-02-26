import { Document, Types } from 'mongoose';

export interface IAdminLog extends Document {
  adminUser: Types.ObjectId;
  action: string;
  entityType?: string;
  entityId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
