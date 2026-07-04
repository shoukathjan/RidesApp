import { DriverStatus, Rooms, SocketEvents, VehicleType } from '@useme/shared';
import { Socket } from 'socket.io';
import { DriverModel } from '../../models/Driver';

/**
 * Driver presence handlers. The location attached to "online" is a one-shot
 * snapshot used only for radius filtering — it is never streamed onward.
 */
export function registerDriverHandlers(socket: Socket): void {
  const driverId = socket.data.driverId as string | undefined;
  const vehicleType = socket.data.vehicleType as VehicleType | undefined;

  socket.on(
    SocketEvents.DRIVER_ONLINE,
    async (payload: { location?: { lat: number; lng: number } }) => {
      if (!driverId) return;
      if (vehicleType) socket.join(Rooms.requestsByVehicle(vehicleType));
      socket.join(Rooms.driver(driverId));

      await DriverModel.findByIdAndUpdate(driverId, {
        onlineStatus: DriverStatus.ONLINE,
        ...(payload?.location
          ? {
              currentLocation: {
                lat: payload.location.lat,
                lng: payload.location.lng,
                updatedAt: new Date(),
              },
            }
          : {}),
      });
    },
  );

  socket.on(SocketEvents.DRIVER_OFFLINE, async () => {
    if (!driverId) return;
    if (vehicleType) socket.leave(Rooms.requestsByVehicle(vehicleType));
    await DriverModel.findByIdAndUpdate(driverId, {
      onlineStatus: DriverStatus.OFFLINE,
    });
  });
}
