export enum VehicleType {
  AUTO = 'AUTO',
  BIKE = 'BIKE',
  CAR = 'CAR',
  TRUCK = 'TRUCK',
}

export const VEHICLE_TYPES: VehicleType[] = [
  VehicleType.AUTO,
  VehicleType.BIKE,
  VehicleType.CAR,
  VehicleType.TRUCK,
];

export const VehicleTypeLabel: Record<VehicleType, string> = {
  [VehicleType.AUTO]: 'Auto',
  [VehicleType.BIKE]: 'Bike',
  [VehicleType.CAR]: 'Car',
  [VehicleType.TRUCK]: 'Truck',
};
