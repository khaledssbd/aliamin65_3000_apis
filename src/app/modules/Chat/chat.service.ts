import ChatMessageModel from './chat.model';
import { Types } from 'mongoose';

// 1. listMessagesByOrderIdFromDB
const listMessagesByOrderIdFromDB = async (orderId: string) => {
  return ChatMessageModel.find({ order: orderId }).sort({ createdAt: 1 });
};

// 2. listMyChatThreadsFromDB
const listMyChatThreadsFromDB = async (userId: Types.ObjectId) => {
  return ChatMessageModel.aggregate([
    { $match: { $or: [{ from: userId }, { to: userId }] } },
    { $group: { _id: '$order', lastAt: { $max: '$createdAt' } } },
    { $sort: { lastAt: -1 } },
  ]);
};

export const ChatService = {
  listMessagesByOrderIdFromDB,
  listMyChatThreadsFromDB,
};
