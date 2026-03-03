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

// 2. getChatThreads
const getChatThreads = asyncHandler(async (req, res) => {
  const docs = await ChatService.getChatThreadsFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Chat threads retrieved',
    data: docs,
  });
});

export const ChatController = {
  getChatMessages,
  getChatThreads,
};
