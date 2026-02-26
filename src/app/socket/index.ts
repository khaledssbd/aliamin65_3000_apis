import { EventEmitter } from 'events';

let emitter: EventEmitter | null = null;

export const initSocket = () => {
  emitter = new EventEmitter();
  return emitter;
};

export const getIO = () => emitter;

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
