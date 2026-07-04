import { Rooms } from '@useme/shared';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { verifyToken } from '../utils/jwt';
import { DriverModel } from '../models/Driver';
import { setIo } from './io';
import { registerBookingHandlers } from './handlers/bookingHandlers';
import { registerDriverHandlers } from './handlers/driverHandlers';

/**
 * Initialise the Socket.IO server. Auth via JWT in the handshake. Customers
 * join their personal room to receive status-only booking updates; drivers
 * join their room (and a per-vehicle-type room once they go online).
 */
export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigins, credentials: true },
  });
  setIo(io);

  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.headers.authorization?.replace('Bearer ', '') as
          | string
          | undefined);
      if (!token) return next(new Error('Missing token'));

      const payload = verifyToken(token);
      socket.data.role = payload.role;

      if (payload.role === 'customer') {
        socket.data.userId = payload.sub;
      } else if (payload.role === 'driver') {
        socket.data.driverId = payload.sub;
        const driver = await DriverModel.findById(payload.sub).lean();
        socket.data.vehicleType = driver?.vehicleType;
      }
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { role, userId, driverId } = socket.data;

    if (role === 'customer' && userId) {
      socket.join(Rooms.customer(userId));
    }
    if (role === 'driver' && driverId) {
      socket.join(Rooms.driver(driverId));
      registerDriverHandlers(socket);
      registerBookingHandlers(socket);
    }
  });

  return io;
}
