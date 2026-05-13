import ChatMessageModel from './chat.model';
import { Types } from 'mongoose';
import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { ROLE, TRole } from '../User/user.constant';
import OrderModel from '../Order/order.model';
import { TChatContentType } from './chat.interface';
import { sendImageToCloudinary } from '../../lib';

// 1. getChatMessagesFromDB
const getChatMessagesFromDB = async (orderId: string) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid order id');
  }

  return ChatMessageModel.find({ order: orderId })
    .sort({ createdAt: 1 })
    .populate('from', 'name email phone image role isActive')
    .populate('to', 'name email phone image role isActive')
    .lean();
};

type TSendChatMessagePayload = {
  orderId: string;
  senderId: string;
  to?: string;
  contentType?: TChatContentType;
  content?: string;
};

type TSendChatImagePayload = {
  orderId: string;
  senderId: string;
  to?: string;
  imageFile: Express.Multer.File;
};

// sendChatMessageIntoDB
const sendChatMessageIntoDB = async (payload: TSendChatMessagePayload) => {
  const { orderId, senderId } = payload;
  const content = String(payload.content ?? '').trim();
  const contentType = payload.contentType ?? 'TEXT';

  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid order id');
  }

  if (!Types.ObjectId.isValid(senderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sender id');
  }

  if (!content) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Message content is required');
  }

  if (!['TEXT', 'IMAGE'].includes(contentType)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid message content type');
  }

  const order = await OrderModel.findById(orderId).select('customer driver');
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  let receiverId = payload.to;

  if (!receiverId || !Types.ObjectId.isValid(receiverId)) {
    const customerId = order.customer ? String(order.customer) : null;
    const driverId = order.driver ? String(order.driver) : null;

    if (!customerId || !driverId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Order customer and driver are required for chat',
      );
    }

    receiverId = customerId === senderId ? driverId : customerId;
  }

  const created = await ChatMessageModel.create({
    order: orderId,
    from: senderId,
    to: receiverId,
    contentType,
    content,
    deliveredAt: new Date(),
  });

  return ChatMessageModel.findById(created._id)
    .populate('from', 'name email phone image role isActive')
    .populate('to', 'name email phone image role isActive')
    .lean();
};

// sendChatImageIntoDB
const sendChatImageIntoDB = async (payload: TSendChatImagePayload) => {
  const { orderId, senderId, imageFile } = payload;

  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid order id');
  }

  if (!Types.ObjectId.isValid(senderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sender id');
  }

  if (!imageFile) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
  }

  const order = await OrderModel.findById(orderId).select('customer driver');
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const uploaded = await sendImageToCloudinary(imageFile);
  const created = await ChatMessageModel.create({
    order: orderId,
    from: senderId,
    to:
      payload.to && Types.ObjectId.isValid(payload.to)
        ? payload.to
        : String(order.customer) === senderId
          ? order.driver
          : order.customer,
    contentType: 'IMAGE',
    content: uploaded.secure_url,
    deliveredAt: new Date(),
  });

  return ChatMessageModel.findById(created._id)
    .populate('from', 'name email phone image role isActive')
    .populate('to', 'name email phone image role isActive')
    .lean();
};

// 2. getChatThreadsFromDB
const getChatThreadsFromDB = async (userId: Types.ObjectId, role?: TRole) => {
  const isAdmin = role === ROLE.ADMIN || role === ROLE.SUPER_ADMIN;
  const matchStage = isAdmin
    ? { order: { $exists: true, $ne: null } }
    : { $or: [{ from: userId }, { to: userId }] };

  return ChatMessageModel.aggregate([
    { $match: matchStage },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: '$order',
        lastMessageAt: { $last: '$createdAt' },
        lastMessage: { $last: '$content' },
        lastContentType: { $last: '$contentType' },
        lastFrom: { $last: '$from' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$to', userId] },
                  {
                    $or: [{ $eq: ['$readAt', null] }, { $not: ['$readAt'] }],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'order.customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'order.driver',
        foreignField: '_id',
        as: 'driver',
      },
    },
    { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        orderId: '$_id',
        lastMessageAt: 1,
        lastMessage: 1,
        lastContentType: 1,
        lastFrom: 1,
        unreadCount: 1,
        order: {
          _id: '$order._id',
          status: '$order.status',
          serviceType: '$order.serviceType',
          address: '$order.address',
          total: '$order.total',
          createdAt: '$order.createdAt',
        },
        customer: {
          _id: '$customer._id',
          name: '$customer.name',
          email: '$customer.email',
          phone: '$customer.phone',
          image: '$customer.image',
          role: '$customer.role',
          isActive: '$customer.isActive',
        },
        driver: {
          _id: '$driver._id',
          name: '$driver.name',
          email: '$driver.email',
          phone: '$driver.phone',
          image: '$driver.image',
          role: '$driver.role',
          isActive: '$driver.isActive',
        },
      },
    },
    { $sort: { lastMessageAt: -1 } },
  ]);
};

export const ChatService = {
  getChatMessagesFromDB,
  sendChatMessageIntoDB,
  sendChatImageIntoDB,
  getChatThreadsFromDB,
};
