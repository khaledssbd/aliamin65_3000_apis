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
    licenseImageUrl: { type: String },
    selfieImageUrl: { type: String },
    identity: {
      firstName: { type: String },
      lastName: { type: String },
      dateOfBirth: { type: Date },
      idNumber: { type: String },
      documentType: { type: String },
      documentCountry: { type: String },
      fullAddress: { type: String },
    },
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

const DriverModel = model<IDriver>('Driver', driverSchema);
export default DriverModel;
