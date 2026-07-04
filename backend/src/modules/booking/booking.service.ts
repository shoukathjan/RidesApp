import {
  BookingStatus,
  CANCELLABLE_STATUSES,
  Coordinates,
  DriverStatus,
  DriverActiveRideSummary,
  FareEstimate,
  haversineKm,
  RideRequestFeedItem,
  RideRequestsFeedResponse,
  VehicleType,
} from '@useme/shared';
import { BookingModel } from '../../models/Booking';
import { DriverModel } from '../../models/Driver';
import { FareConfigModel } from '../../models/FareConfig';
import { getAppSettings } from '../../models/AppSettings';
import { drivingDistanceKm } from '../places/providers/openrouteservice';
import {
  emitBookingAssigned,
  emitBookingStatus,
  emitRequestsRefresh,
} from '../../realtime/io';
import { badRequest, conflict, forbidden, notFound } from '../../utils/http';

const ACTIVE_DRIVER_STATUSES: BookingStatus[] = [
  BookingStatus.DRIVER_ACCEPTED,
  BookingStatus.DRIVER_ARRIVED,
  BookingStatus.RIDE_STARTED,
];

export async function getActiveRideForDriver(
  driverId: string,
): Promise<DriverActiveRideSummary | null> {
  const activeDoc = await BookingModel.findOne({
    claimedByDriverId: driverId,
    status: { $in: ACTIVE_DRIVER_STATUSES },
  });
  if (!activeDoc) return null;
  return {
    _id: String(activeDoc._id),
    status: activeDoc.status as BookingStatus,
    fareEstimate: activeDoc.fareEstimate,
    scheduledAt: activeDoc.scheduledAt.toISOString(),
    pickup: activeDoc.pickup as DriverActiveRideSummary['pickup'],
    destination: activeDoc.destination as DriverActiveRideSummary['destination'],
  };
}

export async function estimateFare(
  vehicleType: VehicleType,
  pickup: Coordinates,
  destination: Coordinates,
): Promise<FareEstimate> {
  const config = await FareConfigModel.findOne({ vehicleType, active: true });
  if (!config) {
    throw notFound(`No active fare config for ${vehicleType}. Ask admin to enable fares.`);
  }

  let roadKm: number | null = null;
  try {
    roadKm = await drivingDistanceKm(pickup, destination);
  } catch {
    roadKm = null;
  }

  const straightKm = haversineKm(pickup, destination);
  const distanceKm = Number((roadKm ?? straightKm).toFixed(2));
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw badRequest('Could not calculate distance between pickup and destination');
  }

  const total = Number(
    (config.baseFare + config.perKmRate * distanceKm).toFixed(2),
  );
  if (!Number.isFinite(total) || total < 0) {
    throw badRequest('Could not calculate fare for this route');
  }

  return {
    vehicleType,
    distanceKm,
    baseFare: config.baseFare,
    perKmRate: config.perKmRate,
    total,
  };
}

interface CreateBookingInput {
  pickup: { address?: string; coordinates: Coordinates };
  destination: { address?: string; coordinates: Coordinates };
  vehicleType: VehicleType;
  scheduledAt: string;
}

export async function createBooking(
  customerId: string,
  input: CreateBookingInput,
) {
  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
    throw badRequest('scheduledAt must be a valid future time');
  }
  const fare = await estimateFare(
    input.vehicleType,
    input.pickup.coordinates,
    input.destination.coordinates,
  );

  const booking = await BookingModel.create({
    customerId,
    pickup: input.pickup,
    destination: input.destination,
    vehicleType: input.vehicleType,
    scheduledAt,
    status: BookingStatus.SEARCHING_FOR_DRIVER,
    fareEstimate: fare.total,
    distanceKm: fare.distanceKm,
  });

  emitBookingStatus(customerId, String(booking._id), booking.status);
  emitRequestsRefresh(input.vehicleType);
  return booking;
}

export async function getBooking(bookingId: string) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw notFound('Booking not found');
  return booking;
}

export async function listCustomerHistory(customerId: string) {
  return BookingModel.find({ customerId }).sort({ createdAt: -1 });
}

/**
 * Ride-requests feed for a driver: must be ONLINE with a location snapshot.
 * Returns open bookings matching vehicle type, scheduled in the future, unclaimed,
 * and within requestRadiusKm (default 10 km) of the driver's location.
 */
export async function listRideRequestsForDriver(
  driverId: string,
): Promise<RideRequestsFeedResponse> {
  const driver = await DriverModel.findById(driverId);
  if (!driver) throw notFound('Driver not found');

  const settings = await getAppSettings();
  const activeRide = await getActiveRideForDriver(driverId);

  const empty: RideRequestsFeedResponse = {
    requestRadiusKm: settings.requestRadiusKm,
    onlineStatus: driver.onlineStatus as DriverStatus,
    requests: [],
    activeRide,
  };

  if (activeRide) {
    return empty;
  }

  if (driver.onlineStatus !== DriverStatus.ONLINE || !driver.currentLocation) {
    return empty;
  }

  const origin: Coordinates = {
    lat: driver.currentLocation.lat,
    lng: driver.currentLocation.lng,
  };

  const open = await BookingModel.find({
    status: BookingStatus.SEARCHING_FOR_DRIVER,
    vehicleType: driver.vehicleType,
    claimedByDriverId: null,
    scheduledAt: { $gt: new Date() },
  }).sort({ scheduledAt: 1 });

  const requests: RideRequestFeedItem[] = open
    .map((b) => {
      const distanceFromDriverKm = Number(
        haversineKm(origin, b.pickup.coordinates as Coordinates).toFixed(2),
      );
      return {
        _id: String(b._id),
        vehicleType: b.vehicleType as VehicleType,
        fareEstimate: b.fareEstimate,
        distanceKm: b.distanceKm,
        distanceFromDriverKm,
        scheduledAt: b.scheduledAt.toISOString(),
        pickup: b.pickup as RideRequestFeedItem['pickup'],
        destination: b.destination as RideRequestFeedItem['destination'],
      };
    })
    .filter((item) => item.distanceFromDriverKm <= settings.requestRadiusKm)
    .sort((a, b) => a.distanceFromDriverKm - b.distanceFromDriverKm);

  return {
    requestRadiusKm: settings.requestRadiusKm,
    onlineStatus: driver.onlineStatus as DriverStatus,
    requests,
    activeRide,
  };
}

async function hasActiveRide(driverId: string): Promise<boolean> {
  const active = await BookingModel.exists({
    claimedByDriverId: driverId,
    status: { $in: ACTIVE_DRIVER_STATUSES },
  });
  return Boolean(active);
}

/** First-come-first-serve atomic claim. */
export async function acceptBooking(driverId: string, bookingId: string) {
  if (await hasActiveRide(driverId)) {
    throw conflict('You already have an active ride');
  }
  const booking = await BookingModel.findOneAndUpdate(
    {
      _id: bookingId,
      status: BookingStatus.SEARCHING_FOR_DRIVER,
      claimedByDriverId: null,
    },
    {
      $set: {
        claimedByDriverId: driverId,
        status: BookingStatus.DRIVER_ACCEPTED,
      },
    },
    { new: true },
  );
  if (!booking) throw conflict('Booking is no longer available');

  emitBookingStatus(String(booking.customerId), bookingId, booking.status);
  emitBookingAssigned(driverId, bookingId);
  emitRequestsRefresh(booking.vehicleType);
  return booking;
}

async function transition(
  driverId: string,
  bookingId: string,
  from: BookingStatus[],
  to: BookingStatus,
  extra: Record<string, unknown> = {},
) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw notFound('Booking not found');
  if (String(booking.claimedByDriverId) !== driverId) {
    throw forbidden('This booking is not assigned to you');
  }
  if (!from.includes(booking.status as BookingStatus)) {
    throw conflict(`Cannot move from ${booking.status} to ${to}`);
  }
  booking.status = to;
  Object.assign(booking, extra);
  await booking.save();
  emitBookingStatus(String(booking.customerId), bookingId, to);
  return booking;
}

export function markArrived(driverId: string, bookingId: string) {
  return transition(
    driverId,
    bookingId,
    [BookingStatus.DRIVER_ACCEPTED],
    BookingStatus.DRIVER_ARRIVED,
  );
}

export function startRide(driverId: string, bookingId: string) {
  return transition(
    driverId,
    bookingId,
    [BookingStatus.DRIVER_ARRIVED, BookingStatus.DRIVER_ACCEPTED],
    BookingStatus.RIDE_STARTED,
  );
}

export function completeRide(driverId: string, bookingId: string) {
  return transition(
    driverId,
    bookingId,
    [BookingStatus.RIDE_STARTED],
    BookingStatus.RIDE_COMPLETED,
    { fareCollected: true },
  );
}

/** Cancel allowed for customer or assigned driver, only before RIDE_STARTED. */
export async function cancelBooking(
  actor: { role: 'customer' | 'driver'; id: string },
  bookingId: string,
) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw notFound('Booking not found');

  if (actor.role === 'customer' && String(booking.customerId) !== actor.id) {
    throw forbidden('Not your booking');
  }
  if (
    actor.role === 'driver' &&
    String(booking.claimedByDriverId) !== actor.id
  ) {
    throw forbidden('Not your booking');
  }
  if (!CANCELLABLE_STATUSES.includes(booking.status as BookingStatus)) {
    throw conflict('Ride can no longer be cancelled');
  }

  booking.status = BookingStatus.RIDE_CANCELLED;
  await booking.save();
  emitBookingStatus(
    String(booking.customerId),
    bookingId,
    BookingStatus.RIDE_CANCELLED,
  );
  emitRequestsRefresh(booking.vehicleType);
  return booking;
}
