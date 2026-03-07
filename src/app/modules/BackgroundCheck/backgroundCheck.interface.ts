import { Document, Types } from 'mongoose';
import { TBackgroundStatus } from '../Driver/driver.interface';

export type TBackgroundProvider = 'VERIFF';

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
