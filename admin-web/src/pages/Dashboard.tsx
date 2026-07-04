import { BookingStatusLabel, VehicleTypeLabel } from '@useme/shared';
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Loader,
  TrendingUp,
  UserCircle,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import DataTable, { CellPrimary } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import { Card } from '../components/ui/Card';
import { formatDateTime, formatMoney, formatPhone } from '../lib/format';

interface DashboardSummary {
  totalDrivers: number;
  pendingDrivers: number;
  approvedDrivers: number;
  rejectedDrivers: number;
  onlineDrivers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalCustomers: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  inProgressBookings: number;
  bookingsToday: number;
  completedToday: number;
  paidSubscriptions: number;
  failedSubscriptions: number;
  pendingPaymentSubscriptions: number;
  totalRevenue: number;
  revenueLast30Days: number;
  revenueToday: number;
  avgCompletedFare: number;
  completionRate: number;
  subscriptionRate: number;
}

interface DashboardCharts {
  bookingsTrend: { date: string; count: number }[];
  subscriptionRevenueTrend: { date: string; count: number }[];
  subscriptionCountTrend: { date: string; count: number }[];
  driversByVehicleType: { vehicleType: string; count: number }[];
  bookingsByStatus: { status: string; count: number }[];
  bookingsByVehicle: { vehicleType: string; count: number }[];
  subscriptionByStatus: { status: string; count: number }[];
}

interface PopulatedRef {
  phone?: string;
  name?: string;
}

interface DashboardData {
  summary: DashboardSummary;
  charts: DashboardCharts;
  recent: {
    subscriptions: Array<{
      _id: string;
      validFrom?: string;
      validUntil?: string;
      driverId?: PopulatedRef | string;
      planId?: { name?: string; amount?: number } | string;
    }>;
    bookings: Array<{
      _id: string;
      status: string;
      vehicleType: string;
      fareEstimate: number;
      createdAt: string;
      customerId?: PopulatedRef | string;
      claimedByDriverId?: PopulatedRef | string;
    }>;
  };
}

const BOOKING_CHART_COLORS: Record<string, string> = {
  RIDE_COMPLETED: '#34a853',
  RIDE_CANCELLED: '#dc2626',
  SEARCHING_FOR_DRIVER: '#d97706',
  DRIVER_ASSIGNED: '#5b9bd5',
  DRIVER_ACCEPTED: '#1c5e78',
  DRIVER_ARRIVED: '#9b59b6',
  RIDE_STARTED: '#f4a261',
};

const SUB_STATUS_COLORS: Record<string, string> = {
  PAID: '#34a853',
  CREATED: '#d97706',
  FAILED: '#dc2626',
};

function shortDay(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

function asRef(ref: PopulatedRef | string | undefined): PopulatedRef | null {
  if (!ref || typeof ref === 'string') return null;
  return ref;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>('/admin/dashboard')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.summary;
  const charts = data?.charts;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Dashboard"
        subtitle={
          loading
            ? 'Loading analytics…'
            : `Overview · ${s?.totalBookings ?? 0} bookings · ${formatMoney(s?.totalRevenue)} subscription revenue`
        }
      />

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Key metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total drivers" value={s?.totalDrivers ?? '—'} hint={`${s?.onlineDrivers ?? 0} online now`} icon={Users} />
          <StatCard label="Pending approvals" value={s?.pendingDrivers ?? '—'} tone="warning" icon={Clock} />
          <StatCard label="Active subscriptions" value={s?.activeSubscriptions ?? '—'} tone="success" hint={`${s?.subscriptionRate ?? 0}% of approved`} icon={CreditCard} />
          <StatCard label="Total customers" value={s?.totalCustomers ?? '—'} icon={UserCircle} />
          <StatCard label="Total bookings" value={s?.totalBookings ?? '—'} hint={`${s?.bookingsToday ?? 0} today`} icon={Car} />
          <StatCard label="Completed rides" value={s?.completedBookings ?? '—'} tone="success" hint={`${s?.completionRate ?? 0}% completion`} icon={CheckCircle2} />
          <StatCard label="In progress" value={s?.inProgressBookings ?? '—'} tone="primary" icon={Loader} />
          <StatCard label="Cancelled" value={s?.cancelledBookings ?? '—'} tone="danger" icon={XCircle} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Revenue & subscriptions</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total revenue" value={formatMoney(s?.totalRevenue)} tone="success" hint={`${s?.paidSubscriptions ?? 0} paid`} icon={IndianRupee} />
          <StatCard label="Last 30 days" value={formatMoney(s?.revenueLast30Days)} icon={TrendingUp} />
          <StatCard label="Today" value={formatMoney(s?.revenueToday)} tone="success" icon={IndianRupee} />
          <StatCard label="Avg completed fare" value={formatMoney(s?.avgCompletedFare)} hint="Per ride estimate" icon={Car} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard label="Expired subscriptions" value={s?.expiredSubscriptions ?? '—'} tone="neutral" />
          <StatCard label="Failed payments" value={s?.failedSubscriptions ?? '—'} tone="danger" icon={AlertTriangle} />
          <StatCard label="Pending payment" value={s?.pendingPaymentSubscriptions ?? '—'} tone="warning" icon={Clock} />
        </div>
      </section>

      {charts ? (
        <>
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Last 7 days</h2>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Bookings per day</h3>
                <BarChart
                  data={charts.bookingsTrend.map((d) => ({
                    label: shortDay(d.date),
                    value: d.count,
                    color: '#1c5e78',
                  }))}
                />
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Subscription revenue per day</h3>
                <BarChart
                  data={charts.subscriptionRevenueTrend.map((d) => ({
                    label: shortDay(d.date),
                    value: d.count,
                    color: '#34a853',
                  }))}
                  formatValue={(v) => `₹${v}`}
                />
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">New subscriptions per day</h3>
                <BarChart
                  data={charts.subscriptionCountTrend.map((d) => ({
                    label: shortDay(d.date),
                    value: d.count,
                    color: '#5b9bd5',
                  }))}
                />
              </Card>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Breakdown</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Bookings by status</h3>
                <DonutChart
                  data={charts.bookingsByStatus.map((item) => ({
                    label: BookingStatusLabel[item.status as keyof typeof BookingStatusLabel] ?? item.status,
                    value: item.count,
                    color: BOOKING_CHART_COLORS[item.status] ?? '#9ca3af',
                  }))}
                />
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Subscriptions by status</h3>
                <DonutChart
                  data={charts.subscriptionByStatus.map((item) => ({
                    label: item.status === 'PAID' ? 'Paid' : item.status === 'CREATED' ? 'Pending' : 'Failed',
                    value: item.count,
                    color: SUB_STATUS_COLORS[item.status] ?? '#9ca3af',
                  }))}
                />
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Drivers by vehicle</h3>
                <BarChart
                  data={charts.driversByVehicleType.map((d) => ({
                    label: VehicleTypeLabel[d.vehicleType as keyof typeof VehicleTypeLabel] ?? d.vehicleType,
                    value: d.count,
                  }))}
                  height={180}
                />
              </Card>
              <Card>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Bookings by vehicle</h3>
                <BarChart
                  data={charts.bookingsByVehicle.map((d) => ({
                    label: VehicleTypeLabel[d.vehicleType as keyof typeof VehicleTypeLabel] ?? d.vehicleType,
                    value: d.count,
                  }))}
                  height={180}
                />
              </Card>
            </div>
          </section>
        </>
      ) : null}

      {data?.recent ? (
        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Recent activity</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Latest subscription payments</h3>
              <DataTable
                rows={data.recent.subscriptions}
                rowKey={(r) => r._id}
                emptyMessage="No paid subscriptions yet."
                columns={[
                  {
                    key: 'driver',
                    header: 'Driver',
                    render: (r) => {
                      const driver = asRef(r.driverId);
                      return formatPhone(driver?.phone) || '—';
                    },
                  },
                  {
                    key: 'plan',
                    header: 'Plan',
                    render: (r) => {
                      const plan = typeof r.planId === 'object' ? r.planId : null;
                      return plan?.name ?? '—';
                    },
                  },
                  {
                    key: 'amount',
                    header: 'Amount',
                    render: (r) => {
                      const plan = typeof r.planId === 'object' ? r.planId : null;
                      return formatMoney(plan?.amount);
                    },
                  },
                  {
                    key: 'validUntil',
                    header: 'Valid until',
                    render: (r) => formatDateTime(r.validUntil),
                  },
                ]}
              />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Latest bookings</h3>
              <DataTable
                rows={data.recent.bookings}
                rowKey={(r) => r._id}
                emptyMessage="No bookings yet."
                columns={[
                  {
                    key: 'customer',
                    header: 'Customer',
                    render: (r) => formatPhone(asRef(r.customerId)?.phone),
                  },
                  {
                    key: 'vehicle',
                    header: 'Vehicle',
                    render: (r) => r.vehicleType,
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (r) => (
                      <CellPrimary>
                        {BookingStatusLabel[r.status as keyof typeof BookingStatusLabel] ?? r.status}
                      </CellPrimary>
                    ),
                  },
                  {
                    key: 'fare',
                    header: 'Fare',
                    render: (r) => formatMoney(r.fareEstimate),
                  },
                  {
                    key: 'when',
                    header: 'Created',
                    render: (r) => formatDateTime(r.createdAt),
                  },
                ]}
              />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
