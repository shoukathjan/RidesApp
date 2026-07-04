export enum BookingStatus {
  SEARCHING_FOR_DRIVER = 'SEARCHING_FOR_DRIVER',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  DRIVER_ACCEPTED = 'DRIVER_ACCEPTED',
  DRIVER_ARRIVED = 'DRIVER_ARRIVED',
  RIDE_STARTED = 'RIDE_STARTED',
  RIDE_COMPLETED = 'RIDE_COMPLETED',
  RIDE_CANCELLED = 'RIDE_CANCELLED',
}

/** Human-readable labels for status-only customer updates. */
export const BookingStatusLabel: Record<BookingStatus, string> = {
  [BookingStatus.SEARCHING_FOR_DRIVER]: 'Searching for driver',
  [BookingStatus.DRIVER_ASSIGNED]: 'Driver assigned',
  [BookingStatus.DRIVER_ACCEPTED]: 'Driver accepted',
  [BookingStatus.DRIVER_ARRIVED]: 'Driver arrived',
  [BookingStatus.RIDE_STARTED]: 'Ride started',
  [BookingStatus.RIDE_COMPLETED]: 'Ride completed',
  [BookingStatus.RIDE_CANCELLED]: 'Ride cancelled',
};

/** Statuses at which a booking is still "open" for drivers to claim. */
export const OPEN_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.SEARCHING_FOR_DRIVER,
];

/** A ride can be cancelled by either party only before it has started. */
export const CANCELLABLE_STATUSES: BookingStatus[] = [
  BookingStatus.SEARCHING_FOR_DRIVER,
  BookingStatus.DRIVER_ASSIGNED,
  BookingStatus.DRIVER_ACCEPTED,
  BookingStatus.DRIVER_ARRIVED,
];
