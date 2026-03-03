// import { Schema, model } from 'mongoose';
// import { IAddress } from './address.interface';

// const addressSchema = new Schema<IAddress>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },
//     label: { type: String },
//     line1: { type: String, required: true },
//     line2: { type: String },
//     city: { type: String, required: true },
//     state: { type: String },
//     postalCode: { type: String },
//     country: { type: String, default: 'US' },
//     location: {
//       type: { type: String, enum: ['Point'] },
//       coordinates: { type: [Number] },
//     },
//     isDefault: { type: Boolean, default: false },
//   },
//   { timestamps: true, versionKey: false },
// );

// addressSchema.index({ location: '2dsphere' });

// const AddressModel = model<IAddress>('Address', addressSchema);
// export default AddressModel;
