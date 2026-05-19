import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { ChatService } from './chat.service';
import { getIO } from '../../socket';

// 1. getChatMessages
const getChatMessages = asyncHandler(async (req, res) => {
  const docs = await ChatService.getChatMessagesFromDB(
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Chat messages retrieved',
    data: docs,
  });
});

const getSupportMessages = asyncHandler(async (req, res) => {
  const docs = await ChatService.getSupportMessagesFromDB(
    String(req.user._id),
    req.query?.to ? String(req.query.to) : undefined,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Support messages retrieved',
    data: docs,
  });
});

// sendChatMessage
const sendChatMessage = asyncHandler(async (req, res) => {
  const doc = await ChatService.sendChatMessageIntoDB({
    orderId: String(req.params.orderId),
    senderId: String(req.user._id),
    to: req.body?.to,
    contentType: req.body?.contentType,
    content: req.body?.content,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Chat message sent',
    data: doc,
  });
});

const sendSupportMessage = asyncHandler(async (req, res) => {
  const doc = await ChatService.sendSupportMessageIntoDB({
    senderId: String(req.user._id),
    to: req.body?.to,
    contentType: req.body?.contentType,
    content: req.body?.content,
  });

  getIO()?.of('/chat').emit('chat:message:notify', { threadType: 'SUPPORT' });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Support message sent',
    data: doc,
  });
});

// sendChatImage
const sendChatImage = asyncHandler(async (req, res) => {
  const doc = await ChatService.sendChatImageIntoDB({
    orderId: String(req.params.orderId),
    senderId: String(req.user._id),
    to: req.body?.to,
    imageFile: req.file as Express.Multer.File,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Chat image sent',
    data: doc,
  });
});

const sendSupportImage = asyncHandler(async (req, res) => {
  const doc = await ChatService.sendSupportImageIntoDB({
    senderId: String(req.user._id),
    to: req.body?.to ?? (req.query?.to ? String(req.query.to) : undefined),
    imageFile: req.file as Express.Multer.File,
  });

  getIO()?.of('/chat').emit('chat:message:notify', { threadType: 'SUPPORT' });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Support image sent',
    data: doc,
  });
});

// 2. getChatThreads
const getChatThreads = asyncHandler(async (req, res) => {
  const docs = await ChatService.getChatThreadsFromDB(
    req.user._id,
    req.user.role,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Chat threads retrieved',
    data: docs,
  });
});

export const ChatController = {
  getChatMessages,
  getSupportMessages,
  sendChatMessage,
  sendSupportMessage,
  sendChatImage,
  sendSupportImage,
  getChatThreads,
};
