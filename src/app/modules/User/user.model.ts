import bcrypt from 'bcryptjs';
import { Aggregate, model, Query, Schema } from 'mongoose';
import config from '../../config';
import { defaultUserImage, ROLE } from './user.constant';
import { IUser, IUserModel } from './user.interface';
import { AppError } from '../../utils';
import httpStatus from 'http-status';

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required!'],
    },
    address: {
      type: String,
      trim: true,
      default: 'N/A',
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
    phone: {
      type: String,
      trim: true,
      required: [true, 'Phone is required!'],
    },
    image: {
      type: String,
      default: defaultUserImage,
    },

    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required!'],
      unique: [true, 'This email is already used!'],
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required!'],
      select: 0, //  works for all normal Mongoose queries (find, findOne, findById, etc.) Does NOT work for aggregation.
    },
    passwordChangedAt: {
      type: Date,
    },

    otp: {
      type: String,
      required: [true, 'OTP is required!'],
    },
    otpExpiry: {
      type: Date,
      required: [true, 'OTP Expiry is required!'],
    },
    isVerifiedByOTP: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.CUSTOMER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deactivationReason: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.index({ currentLocation: '2dsphere' });

// Custom hooks/methods

// Hash password before saving
userSchema.pre('save', async function (this: IUser) {
  // only hash if new user OR password modified
  if (this.isNew || this.isModified('password')) {
    if (!this.password) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Password is required!');
    }

    // 🔑 hash password
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );

    // ⏱️ set password changed time
    if (!this.isModified('passwordChangedAt')) {
      this.passwordChangedAt = new Date();
    }
  }
});

// Clear password after saving
userSchema.post('save', function (doc: IUser, next) {
  if (doc) {
    doc.password = '';
  }
  next();
});

// This makes problem hiding password while gettting user for checking password verification
// userSchema.post('find', function (doc, next) {
//   if (doc) {
//     doc.password = '';
//   }
//   next();
// });

// userSchema.post('findOne', function (doc, next) {
//   if (doc) {
//     doc.password = '';
//   }
//   next();
// });

// Remove deleted documents from find queries

// all find queries
userSchema.pre(/^find/, function (this: Query<IUser, IUser>) {
  // only return non-deleted users
  this.where({ isDeleted: { $ne: true } });
});

//  single find query
// userSchema.pre('find', function (next) {
//   this.find({ isDeleted: { $ne: true } });
//   next();
// });

//  findOne query
// userSchema.pre('findOne', function (next) {
//   this.find({ isDeleted: { $ne: true } });
//   next();
// });

// aggregation query select: 0 Does NOT work for aggregation
userSchema.pre('aggregate', function (this: Aggregate<IUser>) {
  const pipeline = this.pipeline();

  // Always exclude soft-deleted users
  pipeline.unshift({ $match: { isDeleted: { $ne: true } } });

  // Always remove password field from aggregation results
  const projectStage = {
    password: 0,
    // passwordChangedAt: 0,
    otp: 0,
    otpExpiry: 0,
    // isVerifiedByOTP: 0,
    // isActive: 0,
    // isDeleted: 0,
    // deactivationReason: 0,
    // role: 0,
    // createdAt: 0,
    // updatedAt: 0,
  };

  pipeline.unshift({ $project: projectStage });
});

// isUserExistsByEmailWithPassword
userSchema.statics.isUserExistsByEmailWithPassword = async function (
  email: string,
): Promise<IUser | null> {
  return await UserModel.findOne({ email }).select('+password');
};

// isPasswordMatched
userSchema.methods.isPasswordMatched = async function (
  plainTextPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, this.password);
};

// isJWTIssuedBeforePasswordChanged
userSchema.methods.isJWTIssuedBeforePasswordChanged = function (
  jwtIssuedTimestamp: number,
): boolean {
  // if password not changed after jwt issue timestamp
  if (!this.passwordChangedAt) return false;

  const passwordChangedTime = new Date(this.passwordChangedAt).getTime() / 1000;

  return passwordChangedTime > jwtIssuedTimestamp;
};

const UserModel = model<IUser, IUserModel>('User', userSchema);

export default UserModel;
