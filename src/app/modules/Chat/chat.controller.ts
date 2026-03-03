import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { ChatService } from './chat.service';

// 1. listMessagesByOrderId
const listMessagesByOrderId = asyncHandler(async (req, res) => {
  const docs = await ChatService.listMessagesByOrderIdFromDB(
    String(req.params.orderId),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Messages',
    data: docs,
  });
});

// 2. listMyChatThreads
const listMyChatThreads = asyncHandler(async (req, res) => {
  const docs = await ChatService.listMyChatThreadsFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Threads',
    data: docs,
  });
});

export const ChatController = {
  listMessagesByOrderId,
  listMyChatThreads,
};
