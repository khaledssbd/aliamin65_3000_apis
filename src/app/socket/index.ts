/* eslint-disable no-console */
import { Server as HttpServer } from 'http';
import { Server as IOServer, type Socket } from 'socket.io';
import OrderModel from '../modules/Order/order.model';
import UserModel from '../modules/User/user.model';
import mongoose from 'mongoose';

let io: IOServer | null = null;
const onlineUsers = new Map<string, string>();

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
    const userId = socket.handshake.query.userId as string;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      console.error('Socket Auth Failed: Invalid or missing User ID');
      // return next(new Error('User ID is missing or invalid'));
      socket.emit('error', 'User ID is missing');
      socket.disconnect();
      return;
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        console.error(`Socket Auth Failed: User ${userId} not found`);
        // return next(new Error('User not found'));
        socket.emit('error', 'User not found');
        socket.disconnect();
        return;
      }
      socket.join(`user:${userId}`);
      onlineUsers.set(userId, socket.id);
      next();
    } catch (error: unknown) {
      console.error('Socket Middleware DB Error:', error);
      // next(new Error('Internal Server Error'));
      socket.emit('error', 'Internal Server Error');
      socket.disconnect();
      return;
    }
  };

  // --- ORDER NAMESPACE ---
  const ordersNs = io.of('/orders');
  ordersNs.use(checkAuth);

  ordersNs.on('connection', (socket) => {
    const currentUserId = socket.handshake.query.userId as string;
    console.log(`User connected to Orders: ${currentUserId}`);

    socket.on('orders:join', (data: { orderId?: string; role?: string }) => {
      const { orderId, role } = data;
      if (role === 'DRIVER') socket.join(`driver:${currentUserId}`);
      if (role === 'CUSTOMER') socket.join(`customer:${currentUserId}`);
      if (orderId) socket.join(`order:${orderId}`);
    });

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
      onlineUsers.delete(currentUserId);
      console.log(`User disconnected from Orders: ${currentUserId}`);
    });
  });

  // --- CHAT NAMESPACE ---
  const chatNs = io.of('/chat');
  chatNs.use(checkAuth);

  chatNs.on('connection', (socket) => {
    const currentUserId = socket.handshake.query.userId as string;
    console.log(`User connected to Chat: ${currentUserId}`);

    socket.on('chat:join', ({ orderId }: { orderId: string }) => {
      if (orderId) socket.join(`order:${orderId}`);
    });

    socket.on(
      'chat:message',
      (payload: { orderId: string; contentType: string; content: string }) => {
        if (!payload?.orderId) return;
        chatNs.to(`order:${payload.orderId}`).emit('chat:message', {
          message: { ...payload, from: currentUserId, timestamp: new Date() },
        });
      },
    );

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
      onlineUsers.delete(currentUserId);
      console.log(`User disconnected from Chat: ${currentUserId}`);
    });
  });

  // Global connection
  io.on('connection', (socket) => {
    console.log('New global connection:', socket.id);
  });

  return io;
};

export const getIO = () => io;
