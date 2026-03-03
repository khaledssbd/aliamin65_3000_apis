import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { ChatController } from './chat.controller';

const router = Router();

// 1. listMessagesByOrderId
router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  ChatController.listMessagesByOrderId,
);

// 2. listMyChatThreads
router.get(
  '/threads',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  ChatController.listMyChatThreads,
);

export const ChatRoutes = router;
