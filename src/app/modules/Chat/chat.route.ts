import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { ChatController } from './chat.controller';

const router = Router();

// 1. getChatMessages
router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  ChatController.getChatMessages,
);

// 2. getChatThreads
router.get(
  '/threads',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  ChatController.getChatThreads,
);

export const ChatRoutes = router;
