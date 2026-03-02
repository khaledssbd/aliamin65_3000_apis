import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { ChatService } from './chat.service';

const listByOrder = asyncHandler(async (req, res) => {
  const docs = await ChatService.listByOrder(String(req.params.orderId));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Messages',
    data: docs,
  });
});

const threadsMine = asyncHandler(async (req, res) => {
  const docs = await ChatService.threadsMine(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Threads',
    data: docs,
  });
});

export const ChatController = {
  listByOrder,
  threadsMine,
};
