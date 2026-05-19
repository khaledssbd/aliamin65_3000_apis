/* eslint-disable no-console */
import { Server as HttpServer } from 'http';
import { Server as IOServer, type Socket } from 'socket.io';
import OrderModel from '../modules/Order/order.model';
import UserModel from '../modules/User/user.model';
import ChatMessageModel from '../modules/Chat/chat.model';
import { ChatService } from '../modules/Chat/chat.service';
import mongoose from 'mongoose';
import { ROLE } from '../modules/User/user.constant';
import { verifyToken } from '../lib';
import config from '../config';

let io: IOServer | null = null;
const onlineUsers = new Map<string, Set<string>>();
const onlineUserRoles = new Map<string, string>();

const addOnlineUserSocket = (userId: string, socketId: string) => {
  const current = onlineUsers.get(userId);
  if (current) current.add(socketId);
  else onlineUsers.set(userId, new Set([socketId]));
};

const removeOnlineUserSocket = (userId: string, socketId: string) => {
  const current = onlineUsers.get(userId);
  if (!current) return;
  current.delete(socketId);
  if (current.size === 0) onlineUsers.delete(userId);
  if (!onlineUsers.has(userId)) onlineUserRoles.delete(userId);
};

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

export const initSocket = (server: HttpServer) => {
  if (!io) {
    io = new IOServer(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
          'http://localhost:5173',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        // allowedHeaders: ['Authorization', 'Content-Type'],
      },
      // pingInterval: 30000,
      // pingTimeout: 5000,
      // connectTimeout: 45000,
    });
  }

  // --- REUSABLE MIDDLEWARE: Validates User from DB ---
  const checkAuth = async (socket: Socket, next: (err?: Error) => void) => {
    const queryUserId = socket.handshake.query.userId as string | undefined;
    const authToken =
      typeof socket.handshake.auth?.token === 'string'
        ? socket.handshake.auth.token
        : undefined;
    const headerToken = socket.handshake.headers.authorization?.replace(
      'Bearer ',
      '',
    );
    let userId = queryUserId;

    if (!userId && (authToken || headerToken)) {
      try {
        const decoded = verifyToken(
          authToken || headerToken || '',
          config.jwt.access_secret!,
        ) as { _id?: string; id?: string };

        userId = decoded._id || decoded.id;
      } catch {
        console.error('Socket Auth Failed: Invalid token');
        return next(new Error('Unauthorized'));
      }
    }

    // // আইপি অ্যাড্রেস বের করার পদ্ধতি
    // const clientIp = socket.handshake.address;
    // const forwardedIp = socket.handshake.headers['x-forwarded-for'];

    // console.log('--- New Connection Attempt ---');
    // console.log('User ID from Query:', userId);
    // console.log('Client IP:', clientIp);
    // console.log('Forwarded IP (if behind proxy):', forwardedIp);
    // console.log('User Agent:', socket.handshake.headers['user-agent']);
    // console.log('------------------------------');

    if (!userId || !mongoose.isValidObjectId(userId)) {
      console.error('Socket Auth Failed: Invalid or missing User ID');
      return next(new Error('User ID is missing or invalid'));
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        console.error(`Socket Auth Failed: User ${userId} not found`);
        return next(new Error('User not found'));
      }
      socket.data.user = user;
      socket.join(`user:${userId}`);
      addOnlineUserSocket(userId, socket.id);
      onlineUserRoles.set(userId, user.role);
      next();
    } catch (error: unknown) {
      console.error('Socket Middleware DB Error:', error);
      return next(new Error('Internal Server Error'));
    }
  };

  // --- ORDER NAMESPACE ---
  const ordersNs = io.of('/orders');
  ordersNs.use(checkAuth);

  ordersNs.on('connection', (socket) => {
    const currentUserId = String(socket.data.user?._id);
    console.log(`User connected to Orders: ${currentUserId}`);

    // CUSTOMER or DRIVER join for orders: orders:join
    socket.on('orders:join', (data: { orderId?: string; role?: string }) => {
      const { orderId, role } = data;
      if (role === 'DRIVER') socket.join(`driver:${currentUserId}`);
      if (role === 'CUSTOMER') socket.join(`customer:${currentUserId}`);
      if (orderId) socket.join(`order:${orderId}`);
    });

    // DRIVER push location for CUSTOMER tracking
    socket.on(
      'order:tracking:location:push',
      async (data: { orderId: string; lat: number; lng: number }) => {
        const { orderId, lat, lng } = data;
        if (!orderId || typeof lat !== 'number' || typeof lng !== 'number')
          return;

        try {
          const order = await OrderModel.findById(orderId).select('driver');
          if (!order || String(order.driver) !== currentUserId) return;

          await UserModel.findByIdAndUpdate(currentUserId, {
            $set: {
              currentLocation: {
                type: 'Point',
                coordinates: [lng, lat],
                updatedAt: new Date(),
              },
            },
          });

          ordersNs
            .to(`order:${orderId}`)
            .emit('order:tracking:location', { orderId, lat, lng });
        } catch (error) {
          console.error('Location Push Error:', error);
        }
      },
    );

    socket.on('disconnect', () => {
      removeOnlineUserSocket(currentUserId, socket.id);
      console.log(`User disconnected from Orders: ${currentUserId}`);
    });
  });

  // --- CHAT NAMESPACE ---
  const chatNs = io.of('/chat');
  chatNs.use(checkAuth);

  const socketActiveConversation = new Map<string, string | null>();

  // emit online users list to all users who are listening to: chat:online:users
  const emitOnlineUsers = () => {
    chatNs.emit('chat:online:users', { userIds: getOnlineUserIds() });
  };

  const listThreadsForUserFromDB = async (userId: string, role?: string) => {
    const uid = new mongoose.Types.ObjectId(userId);
    return ChatService.getChatThreadsFromDB(uid, role as never);
  };

  const markConversationAsReadInDB = async (
    orderId: string,
    userId: string,
  ) => {
    if (!mongoose.isValidObjectId(orderId)) return;
    const now = new Date();
    await ChatMessageModel.updateMany(
      {
        order: orderId,
        to: userId,
        $or: [{ readAt: { $exists: false } }, { readAt: null }],
      },
      { $set: { readAt: now } },
    );
  };

  const emitThreadsForUser = async (userId: string) => {
    try {
      const threads = await listThreadsForUserFromDB(
        userId,
        onlineUserRoles.get(userId),
      );
      chatNs.to(`user:${userId}`).emit('chat:threads', { threads });
    } catch (error) {
      console.error('Chat Threads Error:', error);
    }
  };

  const emitThreadsForAdmins = async () => {
    const adminIds = Array.from(onlineUserRoles.entries())
      .filter(([, role]) => role === ROLE.ADMIN || role === ROLE.SUPER_ADMIN)
      .map(([userId]) => userId);

    await Promise.all(adminIds.map((userId) => emitThreadsForUser(userId)));
  };

  const isAnySocketInRoom = (room: string, socketIds: Set<string>) => {
    const members = chatNs.adapter.rooms.get(room);
    if (!members) return false;
    for (const sid of socketIds) {
      if (members.has(sid)) return true;
    }
    return false;
  };

  chatNs.on('connection', (socket) => {
    const currentUserId = String(socket.data.user?._id);
    console.log(`User connected to Chat: ${currentUserId}`);

    socketActiveConversation.set(socket.id, null);
    emitOnlineUsers();
    emitThreadsForUser(currentUserId);

    // user see chat list on sidebar => chat:threads:list
    socket.on('chat:threads:list', async () => {
      await emitThreadsForUser(currentUserId);
    });

    // user select a conversation to see all messages: chat:conversation:join
    socket.on(
      'chat:conversation:join',
      async ({ orderId }: { orderId: string }) => {
        if (!orderId || !mongoose.isValidObjectId(orderId)) return;

        const prevOrderId = socketActiveConversation.get(socket.id);
        if (prevOrderId && prevOrderId !== orderId) {
          socket.leave(`order:${prevOrderId}`);
        }

        socket.join(`order:${orderId}`);
        socketActiveConversation.set(socket.id, orderId);

        await markConversationAsReadInDB(orderId, currentUserId);
        await emitThreadsForUser(currentUserId);
        chatNs.to(`order:${orderId}`).emit('chat:conversation:presence', {
          orderId,
          userId: currentUserId,
          status: 'JOINED',
        });
      },
    );

    // user leave a conversation: chat:conversation:leave
    socket.on(
      'chat:conversation:leave',
      async ({ orderId }: { orderId: string }) => {
        if (!orderId) return;
        socket.leave(`order:${orderId}`);

        const active = socketActiveConversation.get(socket.id);
        if (active === orderId) socketActiveConversation.set(socket.id, null);

        chatNs.to(`order:${orderId}`).emit('chat:conversation:presence', {
          orderId,
          userId: currentUserId,
          status: 'LEFT',
        });
      },
    );

    // user selected a conversation now we need to show all messages: chat:messages:list
    socket.on(
      'chat:messages:list',
      async (data: { orderId: string; limit?: number }) => {
        const { orderId } = data;
        const limit = Math.min(Math.max(Number(data.limit ?? 50), 1), 200);
        if (!orderId || !mongoose.isValidObjectId(orderId)) return;

        try {
          const messages = await ChatMessageModel.find({ order: orderId })
            .sort({ createdAt: 1 })
            .limit(limit)
            .populate('from', 'name email phone image role isActive')
            .populate('to', 'name email phone image role isActive');

          socket.emit('chat:messages', { orderId, messages });

          const active = socketActiveConversation.get(socket.id);
          if (active === orderId) {
            await markConversationAsReadInDB(orderId, currentUserId);
            await emitThreadsForUser(currentUserId);
          }
        } catch (error) {
          console.error('Chat Messages List Error:', error);
        }
      },
    );

    // user send a message: chat:message:send
    socket.on(
      'chat:message:send',
      async (payload: {
        orderId: string;
        to?: string;
        contentType: 'TEXT' | 'IMAGE';
        content: string;
      }) => {
        if (!payload?.orderId || !mongoose.isValidObjectId(payload.orderId))
          return;

        if (!payload?.content) return;

        try {
          let receiverId = payload.to;

          if (!receiverId || !mongoose.isValidObjectId(receiverId)) {
            const order = await OrderModel.findById(payload.orderId).select(
              'customer driver',
            );

            if (!order) return;

            const customerId = order.customer ? String(order.customer) : null;

            const driverId = order.driver ? String(order.driver) : null;

            if (!customerId || !driverId) return;

            receiverId = customerId === currentUserId ? driverId : customerId;
          }

          const created = await ChatMessageModel.create({
            order: payload.orderId,
            from: currentUserId,
            to: receiverId,
            contentType: payload.contentType,
            content: payload.content,
            deliveredAt: new Date(),
          });

          const receiverSockets = onlineUsers.get(receiverId);
          const receiverInRoom =
            !!receiverSockets &&
            isAnySocketInRoom(`order:${payload.orderId}`, receiverSockets);

          if (receiverInRoom) {
            await markConversationAsReadInDB(payload.orderId, receiverId);
          }

          chatNs.to(`order:${payload.orderId}`).emit('chat:message', {
            orderId: payload.orderId,
            message: created,
          });

          chatNs.to(`user:${receiverId}`).emit('chat:message:notify', {
            orderId: payload.orderId,
            message: created,
          });

          await emitThreadsForUser(currentUserId);
          await emitThreadsForUser(receiverId);
          await emitThreadsForAdmins();
        } catch (error) {
          console.error('Chat Send Error:', error);
        }
      },
    );

    // user mark conversation as read: chat:message:seen
    socket.on('chat:message:seen', async (data: { orderId: string }) => {
      const { orderId } = data;
      if (!orderId || !mongoose.isValidObjectId(orderId)) return;

      try {
        await markConversationAsReadInDB(orderId, currentUserId);
        await emitThreadsForUser(currentUserId);
      } catch (error) {
        console.error('Chat Seen Error:', error);
      }
    });

    // user typing: chat:typing
    socket.on(
      'chat:typing',
      ({ orderId, isTyping }: { orderId: string; isTyping: boolean }) => {
        if (!orderId) return;
        socket
          .to(`order:${orderId}`)
          .emit('chat:typing', { userId: currentUserId, isTyping });
      },
    );

    socket.on('disconnect', () => {
      socketActiveConversation.delete(socket.id);
      removeOnlineUserSocket(currentUserId, socket.id);
      emitOnlineUsers();
      console.log(`User disconnected from Chat: ${currentUserId}`);
    });
  });

  // --- CALL NAMESPACE (WebRTC Signaling) ---
  // const callNs = io.of('/call');
  // callNs.use(checkAuth);

  // const activeCalls = new Map<string, Set<string>>();
  // roomId -> socketIds

  // callNs.on('connection', (socket) => {
  //   const currentUserId = socket.handshake.query.userId as string;
  //   console.log(`User connected to Call: ${currentUserId}`);

  //   socket.on('call:join', ({ roomId }: { roomId: string }) => {
  //     if (!roomId) return;

  //     socket.join(`call:${roomId}`);

  //     const members = activeCalls.get(roomId) || new Set();
  //     members.add(socket.id);
  //     activeCalls.set(roomId, members);

  //     callNs.to(`call:${roomId}`).emit('call:user:joined', {
  //       userId: currentUserId,
  //       socketId: socket.id,
  //     });
  //   });

  //   socket.on(
  //     'call:offer',
  //     ({
  //       roomId,
  //       offer,
  //       to,
  //     }: {
  //       roomId: string;
  //       offer: RTCSessionDescriptionInit;
  //       to: string;
  //     }) => {
  //       callNs.to(`user:${to}`).emit('call:offer', {
  //         roomId,
  //         offer,
  //         from: currentUserId,
  //       });
  //     },
  //   );

  //   socket.on(
  //     'call:answer',
  //     ({
  //       roomId,
  //       answer,
  //       to,
  //     }: {
  //       roomId: string;
  //       answer: RTCSessionDescriptionInit;
  //       to: string;
  //     }) => {
  //       callNs.to(`user:${to}`).emit('call:answer', {
  //         roomId,
  //         answer,
  //         from: currentUserId,
  //       });
  //     },
  //   );

  //   socket.on(
  //     'call:ice-candidate',
  //     ({
  //       to,
  //       candidate,
  //       roomId,
  //     }: {
  //       to: string;
  //       candidate: RTCIceCandidateInit;
  //       roomId: string;
  //     }) => {
  //       callNs.to(`user:${to}`).emit('call:ice-candidate', {
  //         candidate,
  //         from: currentUserId,
  //         roomId,
  //       });
  //     },
  //   );

  //   socket.on('call:end', ({ roomId }: { roomId: string }) => {
  //     socket.leave(`call:${roomId}`);

  //     const members = activeCalls.get(roomId);
  //     if (members) {
  //       members.delete(socket.id);
  //       if (members.size === 0) activeCalls.delete(roomId);
  //     }

  //     callNs.to(`call:${roomId}`).emit('call:ended', {
  //       roomId,
  //       userId: currentUserId,
  //     });
  //   });

  //   socket.on('disconnect', () => {
  //     console.log(`User disconnected from Call: ${currentUserId}`);
  //   });
  // });

  // Global connection
  io.on('connection', (socket) => {
    console.log('New global connection:', socket.id);
  });

  return io;
};

export const getIO = () => io;
