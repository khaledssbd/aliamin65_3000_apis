import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { NotificationService } from './notification.service';

const listMine = asyncHandler(async (req, res) => {
  const docs = await NotificationService.listMine(req.user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Notifications',
    data: docs,
  });
});

const markRead = asyncHandler(async (req, res) => {
  const doc = await NotificationService.markRead(
    req.user._id,
    String(req.params.id),
  );
  sendResponse(res, { statusCode: httpStatus.OK, message: 'Read', data: doc });
});

const markAllRead = asyncHandler(async (req, res) => {
  await NotificationService.markAllRead(req.user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'All read',
    data: true,
  });
});

const remove = asyncHandler(async (req, res) => {
  const doc = await NotificationService.remove(
    req.user._id,
    String(req.params.id),
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Deleted',
    data: doc,
  });
});

export const NotificationController = {
  listMine,
  markRead,
  markAllRead,
  remove,
};
