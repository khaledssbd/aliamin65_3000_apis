import { Document, Model, Types } from 'mongoose';
import { TRole } from './user.constant';

// Instance methods
export interface IUser extends Document {
  _id: Types.ObjectId;

  name: string;
  // address: string;
  phone: string;
  image: string;

  email: string;
  password: string;
  passwordChangedAt?: Date;

  otp: string;
  otpExpiry: Date;
  isVerifiedByOTP: boolean;

  role: TRole;
  isActive: boolean;
  isDeleted: boolean;
  deactivationReason: string;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isPasswordMatched(plainTextPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    jwtIssuedTimestamp: number | undefined
  ): boolean;
}

// Static methods
export interface IUserModel extends Model<IUser> {
  isUserExistsByEmailWithPassword(email: string): Promise<IUser | null>;
}
