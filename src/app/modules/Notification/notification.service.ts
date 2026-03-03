import NotificationModel from './notification.model';
import { Types } from 'mongoose';

// 1. listMyNotificationsFromDB
const listMyNotificationsFromDB = async (userId: Types.ObjectId) => {
  return NotificationModel.find({ user: userId }).sort({ createdAt: -1 });
};

// 2. markMyNotificationAsReadInDB
const markMyNotificationAsReadInDB = async (
  userId: Types.ObjectId,
  id: string,
) => {
  return NotificationModel.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { readAt: new Date() } },
    { new: true },
  );
};

// 3. markAllMyNotificationsAsReadInDB
const markAllMyNotificationsAsReadInDB = async (userId: Types.ObjectId) => {
  await NotificationModel.updateMany(
    { user: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
  );
  return true;
};

// 4. deleteMyNotificationInDB
const deleteMyNotificationInDB = async (userId: Types.ObjectId, id: string) => {
  return NotificationModel.findOneAndDelete({ _id: id, user: userId });
};

export const NotificationService = {
  listMyNotificationsFromDB,
  markMyNotificationAsReadInDB,
  markAllMyNotificationsAsReadInDB,
  deleteMyNotificationInDB,
};
