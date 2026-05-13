import { Router } from 'express';
import { auth } from '../../middlewares';
import { multerUpload } from '../../lib';
import { ROLE } from '../User/user.constant';
import { ChatController } from './chat.controller';

const router = Router();

// 1. getChatMessages
router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  ChatController.getChatMessages,
);

router.post(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  ChatController.sendChatMessage,
);

router.post(
  '/order/:orderId/image',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  multerUpload.single('image'),
  ChatController.sendChatImage,
);

// 2. getChatThreads
router.get(
  '/threads',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  ChatController.getChatThreads,
);

export const ChatRoutes = router;
