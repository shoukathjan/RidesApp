/**
 * Socket.IO event names. Real-time is limited to booking lifecycle + driver
 * presence. There are NO location-streaming events of any kind.
 */
export const SocketEvents = {
  // Driver presence
  DRIVER_ONLINE: 'driver:online',
  DRIVER_OFFLINE: 'driver:offline',

  // Booking lifecycle (client -> server intents)
  BOOKING_CREATED: 'booking:created',
  BOOKING_ACCEPTED: 'booking:accept',
  BOOKING_REJECTED: 'booking:reject',
  DRIVER_ARRIVED: 'driver:arrived',
  RIDE_STARTED: 'ride:started',
  RIDE_COMPLETED: 'ride:completed',
  RIDE_CANCELLED: 'ride:cancelled',

  // Server -> client broadcasts
  BOOKING_ASSIGNED: 'booking:assigned',
  BOOKING_STATUS_UPDATED: 'booking:status_updated',
  RIDE_REQUESTS_REFRESH: 'requests:refresh',
  /** A booking was claimed — remove it from every driver's feed immediately. */
  RIDE_REQUEST_CLAIMED: 'requests:claimed',
  NOTIFICATION: 'notification',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];

/** Room helpers shared by server + clients. */
export const Rooms = {
  customer: (userId: string) => `customer:${userId}`,
  driver: (driverId: string) => `driver:${driverId}`,
  requestsByVehicle: (vehicleType: string) => `requests:${vehicleType}`,
};
