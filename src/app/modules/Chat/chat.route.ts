import { Router } from 'express';
import { auth } from '../../middlewares';
import { ROLE } from '../User/user.constant';
import { ChatController } from './chat.controller';

const router = Router();

router.get(
  '/order/:orderId',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  ChatController.listByOrder,
);

router.get(
  '/threads',
  auth(ROLE.CUSTOMER, ROLE.DRIVER),
  ChatController.threadsMine,
);

export const ChatRoutes = router;
