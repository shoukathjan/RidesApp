import { ApprovalStatus, BookingStatus, DriverStatus, VehicleType, VEHICLE_TYPES, AppSettings } from '@useme/shared';
import { AppSettingsModel, getAppSettings, serializeAppSettings } from '../../models/AppSettings';
import { BookingModel } from '../../models/Booking';
import { DriverModel } from '../../models/Driver';
import { NotificationModel } from '../../models/Notification';
import { FareConfigModel } from '../../models/FareConfig';
import { SubscriptionModel } from '../../models/Subscription';
import { SubscriptionPlanModel } from '../../models/SubscriptionPlan';
import { UserModel } from '../../models/User';
import { notFound } from '../../utils/http';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = startOfDay(new Date());
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function fillDailyTrend(
  raw: { _id: string; count: number }[],
  days: string[],
): { date: string; count: number }[] {
  const map = new Map(raw.map((r) => [r._id, r.count]));
  return days.map((date) => ({ date, count: map.get(date) ?? 0 }));
}

// ---- Driver approvals ----
export function listDrivers(approvalStatus?: ApprovalStatus) {
  const filter = approvalStatus ? { approvalStatus } : {};
  return DriverModel.find(filter).sort({ createdAt: -1 });
}

export async function setApproval(driverId: string, status: ApprovalStatus) {
  const driver = await DriverModel.findByIdAndUpdate(
    driverId,
    { $set: { approvalStatus: status } },
    { new: true },
  );
  if (!driver) throw notFound('Driver not found');
  return driver;
}

export async function deleteDriver(driverId: string) {
  const driver = await DriverModel.findById(driverId);
  if (!driver) throw notFound('Driver not found');

  const [
    { modifiedCount: cancelledBookings },
    { deletedCount: deletedSubscriptions },
  ] = await Promise.all([
    BookingModel.updateMany(
      {
        claimedByDriverId: driverId,
        status: {
          $nin: [BookingStatus.RIDE_COMPLETED, BookingStatus.RIDE_CANCELLED],
        },
      },
      { $set: { status: BookingStatus.RIDE_CANCELLED } },
    ),
    SubscriptionModel.deleteMany({ driverId }),
    NotificationModel.deleteMany({ recipientId: driverId, recipientRole: 'driver' }),
  ]);

  await DriverModel.findByIdAndDelete(driverId);

  return {
    ok: true,
    phone: driver.phone,
    cancelledBookings,
    deletedSubscriptions,
  };
}

// ---- Subscription plans ----
export function listPlans() {
  return SubscriptionPlanModel.find().sort({ vehicleType: 1, amount: 1 });
}
export function createPlan(data: {
  vehicleType: VehicleType;
  name: string;
  amount: number;
  durationDays: number;
  active?: boolean;
}) {
  return SubscriptionPlanModel.create(data);
}
export async function updatePlan(id: string, data: Record<string, unknown>) {
  const plan = await SubscriptionPlanModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true },
  );
  if (!plan) throw notFound('Plan not found');
  return plan;
}
export async function deletePlan(id: string) {
  const plan = await SubscriptionPlanModel.findByIdAndDelete(id);
  if (!plan) throw notFound('Plan not found');
  return { ok: true };
}

// ---- Fare config ----
export function listFareConfigs() {
  return FareConfigModel.find().sort({ vehicleType: 1 });
}
export async function upsertFareConfig(
  vehicleType: VehicleType,
  data: { baseFare: number; perKmRate: number; active?: boolean },
) {
  return FareConfigModel.findOneAndUpdate(
    { vehicleType },
    { $set: { vehicleType, ...data } },
    { new: true, upsert: true },
  );
}

// ---- App settings (operations + white-label) ----
export async function getSettings(): Promise<AppSettings> {
  const doc = await getAppSettings();
  return serializeAppSettings(doc);
}

export async function updateSettings(data: Partial<AppSettings>) {
  const $set: Record<string, unknown> = {};

  if (data.requestRadiusKm !== undefined) {
    $set.requestRadiusKm = data.requestRadiusKm;
  }
  if (data.branding) {
    for (const [key, value] of Object.entries(data.branding)) {
      if (value !== undefined && typeof value === 'string') {
        $set[`branding.${key}`] = value;
      }
    }
  }
  if (data.theme) {
    for (const [key, value] of Object.entries(data.theme)) {
      if (value !== undefined && typeof value === 'string') {
        $set[`theme.${key}`] = value;
      }
    }
  }
  if (data.logos) {
    for (const [key, value] of Object.entries(data.logos)) {
      if (value !== undefined && typeof value === 'string') {
        $set[`logos.${key}`] = value;
      }
    }
  }

  const doc = await AppSettingsModel.findOneAndUpdate(
    { key: 'global' },
    { $set },
    { new: true, upsert: true },
  );
  if (!doc) throw new Error('Failed to update settings');
  return serializeAppSettings(doc);
}

// ---- Subscriptions overview ----
export function listSubscriptions() {
  return SubscriptionModel.find()
    .sort({ createdAt: -1 })
    .populate('driverId', 'phone name vehicleType')
    .populate('planId', 'name amount durationDays');
}

// ---- Dashboard ----
export async function dashboard() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const trendDays = lastNDays(7);

  const inProgressStatuses = [
    BookingStatus.DRIVER_ASSIGNED,
    BookingStatus.DRIVER_ACCEPTED,
    BookingStatus.DRIVER_ARRIVED,
    BookingStatus.RIDE_STARTED,
    BookingStatus.SEARCHING_FOR_DRIVER,
  ];

  const [
    totalDrivers,
    pendingDrivers,
    approvedDrivers,
    rejectedDrivers,
    onlineDrivers,
    activeSubscriptions,
    expiredSubscriptions,
    totalCustomers,
    totalBookings,
    completedBookings,
    cancelledBookings,
    inProgressBookings,
    bookingsToday,
    completedToday,
    paidSubscriptions,
    failedSubscriptions,
    pendingPaymentSubscriptions,
    revenueAgg,
    revenueLast30Agg,
    revenueTodayAgg,
    driversByVehicle,
    bookingsByStatus,
    bookingsByVehicle,
    bookingsTrendRaw,
    subscriptionsTrendRaw,
    subscriptionStatusBreakdown,
    avgFareAgg,
    recentSubscriptions,
    recentBookings,
  ] = await Promise.all([
    DriverModel.countDocuments(),
    DriverModel.countDocuments({ approvalStatus: ApprovalStatus.PENDING }),
    DriverModel.countDocuments({ approvalStatus: ApprovalStatus.APPROVED }),
    DriverModel.countDocuments({ approvalStatus: ApprovalStatus.REJECTED }),
    DriverModel.countDocuments({ onlineStatus: DriverStatus.ONLINE }),
    DriverModel.countDocuments({ subscriptionValidUntil: { $gt: now } }),
    DriverModel.countDocuments({
      subscriptionValidUntil: { $ne: null, $lte: now },
    }),
    UserModel.countDocuments(),
    BookingModel.countDocuments(),
    BookingModel.countDocuments({ status: BookingStatus.RIDE_COMPLETED }),
    BookingModel.countDocuments({ status: BookingStatus.RIDE_CANCELLED }),
    BookingModel.countDocuments({ status: { $in: inProgressStatuses } }),
    BookingModel.countDocuments({ createdAt: { $gte: todayStart } }),
    BookingModel.countDocuments({
      status: BookingStatus.RIDE_COMPLETED,
      updatedAt: { $gte: todayStart },
    }),
    SubscriptionModel.countDocuments({ status: 'PAID' }),
    SubscriptionModel.countDocuments({ status: 'FAILED' }),
    SubscriptionModel.countDocuments({ status: 'CREATED' }),
    SubscriptionModel.aggregate([
      { $match: { status: 'PAID' } },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      { $unwind: '$plan' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$plan.amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    SubscriptionModel.aggregate([
      { $match: { status: 'PAID', validFrom: { $gte: thirtyDaysAgo } } },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      { $unwind: '$plan' },
      { $group: { _id: null, totalRevenue: { $sum: '$plan.amount' } } },
    ]),
    SubscriptionModel.aggregate([
      { $match: { status: 'PAID', validFrom: { $gte: todayStart } } },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      { $unwind: '$plan' },
      { $group: { _id: null, totalRevenue: { $sum: '$plan.amount' } } },
    ]),
    DriverModel.aggregate([
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    BookingModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    BookingModel.aggregate([
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    BookingModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    SubscriptionModel.aggregate([
      { $match: { status: 'PAID', validFrom: { $gte: sevenDaysAgo } } },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      { $unwind: '$plan' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$validFrom' } },
          count: { $sum: 1 },
          revenue: { $sum: '$plan.amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    SubscriptionModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    BookingModel.aggregate([
      { $match: { status: BookingStatus.RIDE_COMPLETED } },
      { $group: { _id: null, avgFare: { $avg: '$fareEstimate' } } },
    ]),
    SubscriptionModel.find({ status: 'PAID' })
      .sort({ validFrom: -1 })
      .limit(5)
      .populate('driverId', 'phone name')
      .populate('planId', 'name amount'),
    BookingModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'phone name')
      .populate('claimedByDriverId', 'phone name'),
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue ?? 0;
  const revenueLast30Days = revenueLast30Agg[0]?.totalRevenue ?? 0;
  const revenueToday = revenueTodayAgg[0]?.totalRevenue ?? 0;
  const avgCompletedFare = avgFareAgg[0]?.avgFare ?? 0;

  const completionRate =
    totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
  const subscriptionRate =
    approvedDrivers > 0
      ? Math.round((activeSubscriptions / approvedDrivers) * 100)
      : 0;

  const driversByVehicleMap = new Map(
    driversByVehicle.map((r: { _id: string; count: number }) => [r._id, r.count]),
  );
  const driversByVehicleType = VEHICLE_TYPES.map((vehicleType) => ({
    vehicleType,
    count: driversByVehicleMap.get(vehicleType) ?? 0,
  }));

  const subscriptionRevenueTrend = fillDailyTrend(
    subscriptionsTrendRaw.map((r: { _id: string; revenue: number }) => ({
      _id: r._id,
      count: r.revenue,
    })),
    trendDays,
  );

  const subscriptionCountTrend = fillDailyTrend(
    subscriptionsTrendRaw.map((r: { _id: string; count: number }) => ({
      _id: r._id,
      count: r.count,
    })),
    trendDays,
  );

  return {
    summary: {
      totalDrivers,
      pendingDrivers,
      approvedDrivers,
      rejectedDrivers,
      onlineDrivers,
      activeSubscriptions,
      expiredSubscriptions,
      totalCustomers,
      totalBookings,
      completedBookings,
      cancelledBookings,
      inProgressBookings,
      bookingsToday,
      completedToday,
      paidSubscriptions,
      failedSubscriptions,
      pendingPaymentSubscriptions,
      totalRevenue,
      revenueLast30Days,
      revenueToday,
      avgCompletedFare: Math.round(avgCompletedFare),
      completionRate,
      subscriptionRate,
    },
    charts: {
      bookingsTrend: fillDailyTrend(bookingsTrendRaw, trendDays),
      subscriptionRevenueTrend,
      subscriptionCountTrend,
      driversByVehicleType,
      bookingsByStatus: bookingsByStatus.map((r: { _id: string; count: number }) => ({
        status: r._id,
        count: r.count,
      })),
      bookingsByVehicle: bookingsByVehicle.map((r: { _id: string; count: number }) => ({
        vehicleType: r._id,
        count: r.count,
      })),
      subscriptionByStatus: subscriptionStatusBreakdown.map(
        (r: { _id: string; count: number }) => ({
          status: r._id,
          count: r.count,
        }),
      ),
    },
    recent: {
      subscriptions: recentSubscriptions,
      bookings: recentBookings,
    },
  };
}
