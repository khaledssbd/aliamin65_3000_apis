import { Document, Types } from 'mongoose';

export type TDriverStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type TBackgroundStatus = 'PENDING' | 'APPROVED' | 'FAILED';

export interface IDriver extends Document {
  user: Types.ObjectId;
  licenseImageUrl?: string;
  selfieImageUrl?: string;
  identity?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    idNumber?: string;
    documentType?: string;
    documentCountry?: string;
    fullAddress?: string;
  };
  isAvailable?: boolean;
  insurance?: {
    provider?: string;
    policyNumber?: string;
    expiration?: Date;
    documentImageUrl?: string;
  };
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
    plate?: string;
  };
  backgroundCheckStatus: TBackgroundStatus;
  reputationTier: number;
  capacityLimit: number;
  status: TDriverStatus;
  createdAt: Date;
  updatedAt: Date;
}
