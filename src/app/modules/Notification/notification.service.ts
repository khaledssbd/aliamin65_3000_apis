import NotificationModel from './notification.model';
import { Types } from 'mongoose';

// 1. getMyNotificationsFromDB
const getMyNotificationsFromDB = async (userId: Types.ObjectId) => {
  return NotificationModel.find({ user: userId }).sort({ createdAt: -1 });
};

// 2. markMyNotificationAsReadIntoDB
const markMyNotificationAsReadIntoDB = async (
  userId: Types.ObjectId,
  id: string,
) => {
  return NotificationModel.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { readAt: new Date() } },
    { new: true },
  );
};

// 3. markAllMyNotificationsAsReadIntoDB
const markAllMyNotificationsAsReadIntoDB = async (userId: Types.ObjectId) => {
  await NotificationModel.updateMany(
    { user: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
  );
  return true;
};

// 4. deleteMyNotificationFromDB
const deleteMyNotificationFromDB = async (
  userId: Types.ObjectId,
  id: string,
) => {
  return NotificationModel.findOneAndDelete({ _id: id, user: userId });
};

export const NotificationService = {
  getMyNotificationsFromDB,
  markMyNotificationAsReadIntoDB,
  markAllMyNotificationsAsReadIntoDB,
  deleteMyNotificationFromDB,
};
