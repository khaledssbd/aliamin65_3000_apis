import { Document, Types } from 'mongoose';

export type TBackgroundProvider =
  | 'CHECKR'
  | 'KARMACHECK'
  | 'STERLING'
  | 'VERIFF';
export type TBackgroundStatus = 'PENDING' | 'APPROVED' | 'FAILED';

export interface IBackgroundCheck extends Document {
  driver: Types.ObjectId;
  provider: TBackgroundProvider;
  status: TBackgroundStatus;
  reportId?: string;
  criminal?: { status?: TBackgroundStatus };
  mvr?: { status?: TBackgroundStatus };
  identity?: { status?: TBackgroundStatus };
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
