import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { ChatService } from './chat.service';

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

// 2. getChatThreads
const getChatThreads = asyncHandler(async (req, res) => {
  const docs = await ChatService.getChatThreadsFromDB(req.user._id, req.user.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Chat threads retrieved',
    data: docs,
  });
});

export const ChatController = {
  getChatMessages,
  sendChatMessage,
  getChatThreads,
};
