import ChatMessageModel from './chat.model';
import { Types } from 'mongoose';

// 1. getChatMessagesFromDB
const getChatMessagesFromDB = async (orderId: string) => {
  return ChatMessageModel.find({ order: orderId }).sort({ createdAt: 1 });
};

// 2. getChatThreadsFromDB
const getChatThreadsFromDB = async (userId: Types.ObjectId) => {
  return ChatMessageModel.aggregate([
    { $match: { $or: [{ from: userId }, { to: userId }] } },
    { $group: { _id: '$order', lastAt: { $max: '$createdAt' } } },
    { $sort: { lastAt: -1 } },
  ]);
};

export const ChatService = {
  getChatMessagesFromDB,
  getChatThreadsFromDB,
};
