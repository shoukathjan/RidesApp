import {
  ApprovalStatus,
  BookingStatus,
  DriverAccessState,
  DriverStatus,
  VehicleType,
} from '@useme/shared';
import { BookingModel } from '../../models/Booking';
import { DriverModel } from '../../models/Driver';
import { conflict, notFound } from '../../utils/http';

interface RegisterInput {
  phone: string;
  name?: string;
  vehicleType: VehicleType;
  vehicleDetails?: { registrationNumber?: string; model?: string; color?: string };
  documents?: {
    licenseUrl?: string;
    rcUrl?: string;
    insuranceUrl?: string;
    profilePhotoUrl?: string;
  };
}

export async function register(input: RegisterInput) {
  const existing = await DriverModel.findOne({ phone: input.phone });
  if (existing) throw conflict('A driver with this phone already exists');
  return DriverModel.create({
    ...input,
    approvalStatus: ApprovalStatus.PENDING,
  });
}

export async function getProfile(driverId: string) {
  const driver = await DriverModel.findById(driverId);
  if (!driver) throw notFound('Driver not found');
  return driver;
}

export async function updateProfile(
  driverId: string,
  data: Partial<RegisterInput>,
) {
  const driver = await DriverModel.findByIdAndUpdate(
    driverId,
    {
      $set: {
        name: data.name,
        vehicleDetails: data.vehicleDetails,
        documents: data.documents,
      },
    },
    { new: true },
  );
  if (!driver) throw notFound('Driver not found');
  return driver;
}

export async function setOnlineStatus(
  driverId: string,
  status: DriverStatus,
  location?: { lat: number; lng: number },
) {
  const driver = await DriverModel.findByIdAndUpdate(
    driverId,
    {
      $set: {
        onlineStatus: status,
        ...(location
          ? { currentLocation: { ...location, updatedAt: new Date() } }
          : {}),
      },
    },
    { new: true },
  );
  if (!driver) throw notFound('Driver not found');
  return driver;
}

export async function updateLocation(
  driverId: string,
  location: { lat: number; lng: number },
) {
  return setOnlineStatus(driverId, DriverStatus.ONLINE, location);
}

/** Full fare, no commission — aggregate completed-ride fares. */
export async function getEarnings(driverId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

  const completed = await BookingModel.find({
    claimedByDriverId: driverId,
    status: BookingStatus.RIDE_COMPLETED,
  });

  const sum = (since?: Date) =>
    completed
      .filter((b) => (since ? b.updatedAt >= since : true))
      .reduce((acc, b) => acc + b.fareEstimate, 0);

  return {
    today: sum(startOfDay),
    week: sum(startOfWeek),
    total: sum(),
    completedRides: completed.length,
  };
}

export async function getAccessState(
  driverId: string,
): Promise<DriverAccessState> {
  const driver = await DriverModel.findById(driverId);
  if (!driver) throw notFound('Driver not found');

  const validUntil = driver.subscriptionValidUntil;
  const hasActiveSubscription = Boolean(
    validUntil && validUntil.getTime() > Date.now(),
  );

  let gate: DriverAccessState['gate'] = 'PENDING_APPROVAL';
  if (driver.approvalStatus === ApprovalStatus.APPROVED) {
    gate = hasActiveSubscription ? 'RIDE_REQUESTS' : 'NEEDS_SUBSCRIPTION';
  }

  return {
    approvalStatus: driver.approvalStatus as ApprovalStatus,
    hasActiveSubscription,
    subscriptionValidUntil: validUntil ? validUntil.toISOString() : null,
    gate,
  };
}
