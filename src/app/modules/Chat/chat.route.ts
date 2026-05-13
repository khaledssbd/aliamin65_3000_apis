import { Router } from 'express';
import { auth } from '../../middlewares';
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

// 2. getChatThreads
router.get(
  '/threads',
  auth(ROLE.CUSTOMER, ROLE.DRIVER, ROLE.ADMIN, ROLE.SUPER_ADMIN),
  ChatController.getChatThreads,
);

export const ChatRoutes = router;
