import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import OrderModel from '../modules/Order/order.model';
import UserModel from '../modules/User/user.model';

let io: IOServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new IOServer(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:5173',
      ],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  const ordersNs = io.of('/orders');
  ordersNs.on('connection', (socket) => {
    socket.on(
      'orders:join',
      ({
        userId,
        orderId,
        role,
      }: {
        userId: string;
        orderId?: string;
        role?: string;
      }) => {
        if (userId) socket.join(`user:${userId}`);
        if (role === 'DRIVER' && userId) socket.join(`driver:${userId}`);
        if (role === 'CUSTOMER' && userId) socket.join(`customer:${userId}`);
        if (orderId) socket.join(`order:${orderId}`);
      },
    );

    socket.on(
      'order:tracking:location:push',
      async ({
        orderId,
        driverUserId,
        lat,
        lng,
      }: {
        orderId: string;
        driverUserId: string;
        lat: number;
        lng: number;
      }) => {
        if (!orderId || !driverUserId) return;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const order =
          await OrderModel.findById(orderId).select('driver customer');
        if (!order) return;
        if (order.driver && String(order.driver) !== String(driverUserId))
          return;

        await UserModel.findByIdAndUpdate(
          driverUserId,
          {
            $set: {
              currentLocation: {
                type: 'Point',
                coordinates: [lng, lat],
                updatedAt: new Date(),
              },
            },
          },
          { new: true },
        );

        ordersNs.to(`order:${orderId}`).emit('order:tracking:location', {
          orderId,
          lat,
          lng,
        });
      },
    );
  });

  io.on('connection', () => {
    // Global connection
  });

  const chatNs = io.of('/chat');
  chatNs.on('connection', (socket) => {
    socket.on('chat:join', ({ orderId }: { orderId: string }) => {
      if (orderId) socket.join(`order:${orderId}`);
    });
    socket.on(
      'chat:message',
      (payload: {
        orderId: string;
        contentType: string;
        content: string;
        from?: string;
      }) => {
        if (!payload?.orderId) return;
        chatNs.to(`order:${payload.orderId}`).emit('chat:message', {
          message: payload,
        });
      },
    );
    socket.on(
      'chat:typing',
      ({ orderId, isTyping }: { orderId: string; isTyping: boolean }) => {
        if (!orderId) return;
        socket.to(`order:${orderId}`).emit('chat:typing', { isTyping });
      },
    );
  });

  return io;
};

export const getIO = () => io;

// import { Server as HttpServer } from 'http';
// import { Server } from 'socket.io';

// let io: Server | null = null;

// export const initSocket = (server: HttpServer) => {
//   io = new Server(server, {
//     cors: {
//       origin: [
//         'http://localhost:3000',
//         'http://localhost:3001',
//         'http://localhost:3002',
//         'http://localhost:3003',
//         'http://localhost:5173',
//       ],
//       methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//       credentials: true,
//     },
//   });
//   io.on('connection', () => {
//     // No-op for now; rooms are joined by client-side per order/user
//   });
//   return io;
// };

// export const getIO = () => io;
