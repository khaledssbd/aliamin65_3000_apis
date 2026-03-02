import NotificationModel from './notification.model';
import { Types } from 'mongoose';

const listMine = async (userId: Types.ObjectId) => {
  return NotificationModel.find({ user: userId }).sort({ createdAt: -1 });
};

const markRead = async (userId: Types.ObjectId, id: string) => {
  return NotificationModel.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { readAt: new Date() } },
    { new: true },
  );
};

const markAllRead = async (userId: Types.ObjectId) => {
  await NotificationModel.updateMany(
    { user: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
  );
  return true;
};

const remove = async (userId: Types.ObjectId, id: string) => {
  return NotificationModel.findOneAndDelete({ _id: id, user: userId });
};

export const NotificationService = {
  listMine,
  markRead,
  markAllRead,
  remove,
};
