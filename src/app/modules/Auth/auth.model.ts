// import { Schema, model } from 'mongoose';
// import { IAuthToken } from './auth.interface';

// const authTokenSchema = new Schema<IAuthToken>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },
//     refreshToken: { type: String, required: true, unique: true },
//     userAgent: { type: String },
//     ip: { type: String },
//     expiresAt: { type: Date, required: true, index: true },
//     revokedAt: { type: Date },
//   },
//   { timestamps: true, versionKey: false },
// );

// const AuthTokenModel = model<IAuthToken>('AuthToken', authTokenSchema);
// export default AuthTokenModel;
