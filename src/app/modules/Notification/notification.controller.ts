import httpStatus from 'http-status';
import { asyncHandler, sendResponse } from '../../utils';
import { NotificationService } from './notification.service';

// 1. getMyNotifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const docs = await NotificationService.getMyNotificationsFromDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Notifications',
    data: docs,
  });
});

// 2. markMyNotificationAsRead
const markMyNotificationAsRead = asyncHandler(async (req, res) => {
  const doc = await NotificationService.markMyNotificationAsReadIntoDB(
    req.user._id,
    String(req.params.id),
  );

  sendResponse(res, { statusCode: httpStatus.OK, message: 'Read', data: doc });
});

// 3. markAllMyNotificationsAsRead
const markAllMyNotificationsAsRead = asyncHandler(async (req, res) => {
  await NotificationService.markAllMyNotificationsAsReadIntoDB(req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'All read',
    data: true,
  });
});

// 4. deleteMyNotification
const deleteMyNotification = asyncHandler(async (req, res) => {
  const doc = await NotificationService.deleteMyNotificationFromDB(
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
  getMyNotifications,
  markMyNotificationAsRead,
  markAllMyNotificationsAsRead,
  deleteMyNotification,
};
