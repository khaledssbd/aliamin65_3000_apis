import { EventEmitter } from 'events';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';

let emitter: EventEmitter | null = null;

export const initEventBus = () => {
  emitter = new EventEmitter();
  return emitter;
};

export const getEventBus = () => emitter;

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
