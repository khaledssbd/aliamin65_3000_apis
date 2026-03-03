// import { Schema, model } from 'mongoose';
// import { IAdminLog } from './adminLog.interface';

// const adminLogSchema = new Schema<IAdminLog>(
//   {
//     adminUser: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },
//     action: { type: String, required: true },
//     entityType: { type: String },
//     entityId: { type: Schema.Types.ObjectId },
//     metadata: { type: Schema.Types.Mixed },
//   },
//   { timestamps: true, versionKey: false },
// );

// const AdminLogModel = model<IAdminLog>('AdminLog', adminLogSchema);
// export default AdminLogModel;
