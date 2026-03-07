import { Schema, model } from 'mongoose';
import { IBackgroundCheck } from './backgroundCheck.interface';

const backgroundCheckSchema = new Schema<IBackgroundCheck>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['VERIFF'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'FAILED'],
      default: 'PENDING',
    },
    reportId: { type: String },
    criminal: {
      status: { type: String, enum: ['PENDING', 'APPROVED', 'FAILED'] },
    },
    mvr: { status: { type: String, enum: ['PENDING', 'APPROVED', 'FAILED'] } },
    identity: {
      status: { type: String, enum: ['PENDING', 'APPROVED', 'FAILED'] },
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

const BackgroundCheckModel = model<IBackgroundCheck>(
  'BackgroundCheck',
  backgroundCheckSchema,
);
export default BackgroundCheckModel;
