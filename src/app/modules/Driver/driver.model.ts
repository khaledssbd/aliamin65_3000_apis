import { Schema, model } from 'mongoose';
import { IDriver } from './driver.interface';

const driverSchema = new Schema<IDriver>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
      updatedAt: {
        type: Date,
      },
    },
    licenseImageUrl: { type: String },
    selfieImageUrl: { type: String },
    isAvailable: { type: Boolean, default: false },
    insurance: {
      provider: { type: String },
      policyNumber: { type: String },
      expiration: { type: Date },
      documentImageUrl: { type: String },
    },
    vehicle: {
      make: { type: String },
      model: { type: String },
      year: { type: Number },
      plate: { type: String },
    },
    backgroundCheckStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'FAILED'],
      default: 'PENDING',
    },
    reputationTier: { type: Number, default: 1 },
    capacityLimit: { type: Number, default: 3 },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
  },
  { timestamps: true, versionKey: false },
);

driverSchema.index({ currentLocation: '2dsphere' });

const DriverModel = model<IDriver>('Driver', driverSchema);
export default DriverModel;
