import { SocketEvents } from '@useme/shared';
import { Socket } from 'socket.io';
import * as bookingService from '../../modules/booking/booking.service';

/**
 * Booking lifecycle intents over Socket.IO. Each delegates to the booking
 * service (same logic as the REST routes) which persists state and emits the
 * resulting status update to the customer. No location streaming here.
 */
export function registerBookingHandlers(socket: Socket): void {
  const driverId = socket.data.driverId as string | undefined;

  const guardDriver = async (
    fn: (driverId: string) => Promise<unknown>,
    ack?: (res: unknown) => void,
  ) => {
    try {
      if (!driverId) throw new Error('Driver context required');
      const result = await fn(driverId);
      ack?.({ ok: true, result });
    } catch (err) {
      ack?.({ ok: false, error: (err as Error).message });
    }
  };

  socket.on(SocketEvents.BOOKING_ACCEPTED, ({ bookingId }, ack) =>
    guardDriver((d) => bookingService.acceptBooking(d, bookingId), ack),
  );

  socket.on(SocketEvents.DRIVER_ARRIVED, ({ bookingId }, ack) =>
    guardDriver((d) => bookingService.markArrived(d, bookingId), ack),
  );

  socket.on(SocketEvents.RIDE_STARTED, ({ bookingId }, ack) =>
    guardDriver((d) => bookingService.startRide(d, bookingId), ack),
  );

  socket.on(SocketEvents.RIDE_COMPLETED, ({ bookingId }, ack) =>
    guardDriver((d) => bookingService.completeRide(d, bookingId), ack),
  );

  socket.on(SocketEvents.RIDE_CANCELLED, ({ bookingId }, ack) =>
    guardDriver(
      (d) => bookingService.cancelBooking({ role: 'driver', id: d }, bookingId),
      ack,
    ),
  );
}
