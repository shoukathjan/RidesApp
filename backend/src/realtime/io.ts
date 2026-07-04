import { BookingStatus, Rooms, SocketEvents, VehicleType } from '@useme/shared';
import { Server } from 'socket.io';

let io: Server | null = null;

export function setIo(server: Server): void {
  io = server;
}

export function getIo(): Server {
  if (!io) throw new Error('Socket.IO not initialised');
  return io;
}

/** Notify a customer that their booking status changed (status text only). */
export function emitBookingStatus(
  customerId: string,
  bookingId: string,
  status: BookingStatus,
): void {
  getIo()
    .to(Rooms.customer(customerId))
    .emit(SocketEvents.BOOKING_STATUS_UPDATED, {
      bookingId,
      status,
      at: new Date().toISOString(),
    });
}

/** Hint online drivers of a vehicle type to refresh their ride-requests feed. */
export function emitRequestsRefresh(vehicleType: VehicleType): void {
  getIo()
    .to(Rooms.requestsByVehicle(vehicleType))
    .emit(SocketEvents.RIDE_REQUESTS_REFRESH, { vehicleType });
}

/** Tell all online drivers that a request is no longer available. */
export function emitRideRequestClaimed(
  vehicleType: VehicleType,
  bookingId: string,
): void {
  getIo()
    .to(Rooms.requestsByVehicle(vehicleType))
    .emit(SocketEvents.RIDE_REQUEST_CLAIMED, { vehicleType, bookingId });
}

/** Tell a specific driver a booking was assigned to them. */
export function emitBookingAssigned(driverId: string, bookingId: string): void {
  getIo()
    .to(Rooms.driver(driverId))
    .emit(SocketEvents.BOOKING_ASSIGNED, { bookingId });
}
