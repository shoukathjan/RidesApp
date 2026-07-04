import bcrypt from 'bcryptjs';
import { VehicleType, VEHICLE_TYPES } from '@useme/shared';
import { connectDb, disconnectDb } from '../db/mongoose';
import { AdminModel } from '../models/Admin';
import { FareConfigModel } from '../models/FareConfig';
import { SubscriptionPlanModel } from '../models/SubscriptionPlan';
import { getAppSettings } from '../models/AppSettings';

const FARE_DEFAULTS: Record<VehicleType, { baseFare: number; perKmRate: number }> = {
  [VehicleType.AUTO]: { baseFare: 30, perKmRate: 12 },
  [VehicleType.BIKE]: { baseFare: 20, perKmRate: 8 },
  [VehicleType.CAR]: { baseFare: 60, perKmRate: 18 },
  [VehicleType.TRUCK]: { baseFare: 150, perKmRate: 35 },
};

async function seed(): Promise<void> {
  await connectDb();

  const email = 'admin@useme.app';
  if (!(await AdminModel.findOne({ email }))) {
    await AdminModel.create({
      email,
      name: 'UseMe Admin',
      passwordHash: await bcrypt.hash('admin123', 10),
    });
    console.log(`[seed] admin created: ${email} / admin123`);
  }

  for (const vehicleType of VEHICLE_TYPES) {
    await FareConfigModel.findOneAndUpdate(
      { vehicleType },
      { $set: { vehicleType, ...FARE_DEFAULTS[vehicleType], active: true } },
      { upsert: true },
    );

    const planName = `${vehicleType} Monthly`;
    if (!(await SubscriptionPlanModel.findOne({ vehicleType, name: planName }))) {
      await SubscriptionPlanModel.create({
        vehicleType,
        name: planName,
        amount: vehicleType === VehicleType.TRUCK ? 1500 : 800,
        durationDays: 30,
        active: true,
      });
    }
  }

  await getAppSettings();
  console.log('[seed] fare configs, plans, and settings ready');

  await disconnectDb();
}

seed().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
