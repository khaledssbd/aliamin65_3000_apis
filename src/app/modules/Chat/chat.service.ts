import ChatMessageModel from './chat.model';
import { Types } from 'mongoose';

const listByOrder = async (orderId: string) => {
  return ChatMessageModel.find({ order: orderId }).sort({ createdAt: 1 });
};

const threadsMine = async (userId: Types.ObjectId) => {
  return ChatMessageModel.aggregate([
    { $match: { $or: [{ from: userId }, { to: userId }] } },
    { $group: { _id: '$order', lastAt: { $max: '$createdAt' } } },
    { $sort: { lastAt: -1 } },
  ]);
};

export const ChatService = {
  listByOrder,
  threadsMine,
};
