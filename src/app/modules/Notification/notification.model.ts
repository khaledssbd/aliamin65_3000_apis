import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['ORDER_STATUS', 'REMINDER', 'PAYMENT', 'SYSTEM', 'CHAT'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String },
    data: { type: Object },
    readAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

const NotificationModel = model<INotification>(
  'Notification',
  notificationSchema,
);
export default NotificationModel;
