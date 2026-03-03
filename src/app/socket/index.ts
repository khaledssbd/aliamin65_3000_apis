import { EventEmitter } from 'events';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import OrderModel from '../modules/Order/order.model';
import DriverModel from '../modules/Driver/driver.model';
import AddressModel from '../modules/Address/address.model';
import { ORDER_STATUS } from '../constants';

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
      'order:driver:accept',
      async ({
        orderId,
        driverUserId,
      }: {
        orderId: string;
        driverUserId: string;
      }) => {
        if (!orderId || !driverUserId) return;

        const order = await OrderModel.findById(orderId);
        if (!order) return;
        if (order.status !== ORDER_STATUS.REQUESTED) return;
        if (order.pendingDriver || order.driver) return;

        await OrderModel.findByIdAndUpdate(orderId, {
          $set: { pendingDriver: driverUserId },
        });

        ordersNs
          .to(`customer:${String(order.customer)}`)
          .emit('order:driver:accepted', {
            orderId,
            driverUserId,
          });
      },
    );

    socket.on(
      'order:customer:confirm',
      async ({
        orderId,
        customerUserId,
      }: {
        orderId: string;
        customerUserId: string;
      }) => {
        if (!orderId || !customerUserId) return;

        const order = await OrderModel.findById(orderId);
        if (!order) return;
        if (String(order.customer) !== String(customerUserId)) return;
        const pendingDriver = order.pendingDriver;
        if (!pendingDriver) return;

        const updated = await OrderModel.findByIdAndUpdate(
          orderId,
          {
            $set: {
              driver: pendingDriver,
              status: ORDER_STATUS.DRIVER_ASSIGNED,
              'timeline.driverAssignedAt': new Date(),
            },
            $unset: { pendingDriver: 1 },
          },
          { new: true },
        );

        ordersNs
          .to(`customer:${String(order.customer)}`)
          .emit('order:confirmed', {
            orderId,
            driverUserId: String(pendingDriver),
          });
        ordersNs.to(`driver:${String(pendingDriver)}`).emit('order:confirmed', {
          orderId,
          customerUserId: String(order.customer),
        });

        const pickupAddress = await AddressModel.findById(order.pickupAddress);
        const coords = pickupAddress?.location?.coordinates;
        if (coords && coords.length === 2) {
          const nearbyDrivers = await DriverModel.find({
            isAvailable: true,
            currentLocation: {
              $near: {
                $geometry: { type: 'Point', coordinates: coords },
                $maxDistance: 5000,
              },
            },
          }).select('user');

          nearbyDrivers
            .map((d) => String(d.user))
            .filter((id) => id !== String(pendingDriver))
            .forEach((id) => {
              ordersNs.to(`driver:${id}`).emit('order:hidden', { orderId });
            });
        }

        void updated;
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

        await DriverModel.findOneAndUpdate(
          { user: driverUserId },
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
