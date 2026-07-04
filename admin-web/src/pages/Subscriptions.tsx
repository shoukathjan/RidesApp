import { useEffect, useState } from 'react';
import { api } from '../api/client';
import DataTable, { CellMono, CellPrimary, CellSecondary } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime, formatMoney, formatPhone } from '../lib/format';

interface PopulatedDriver {
  phone?: string;
  name?: string;
  vehicleType?: string;
}

interface PopulatedPlan {
  name?: string;
  amount?: number;
  durationDays?: number;
}

interface SubRow {
  _id: string;
  vehicleType: string;
  status: string;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  providerPaymentId?: string;
  razorpayPaymentId?: string;
  driverId?: PopulatedDriver | string;
  planId?: PopulatedPlan | string;
}

function asDriver(driver: SubRow['driverId']): PopulatedDriver | null {
  if (!driver || typeof driver === 'string') return null;
  return driver;
}

function asPlan(plan: SubRow['planId']): PopulatedPlan | null {
  if (!plan || typeof plan === 'string') return null;
  return plan;
}

export default function Subscriptions() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<SubRow[]>('/admin/subscriptions')
      .then((r) => setSubs(r.data))
      .finally(() => setLoading(false));
  }, []);

  const paidCount = subs.filter((s) => s.status === 'PAID').length;

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle={`${subs.length} total · ${paidCount} paid`}
      />

      <DataTable
        loading={loading}
        rows={subs}
        rowKey={(s) => s._id}
        emptyMessage="No subscription payments yet."
        caption="All driver subscription orders and payments"
        columns={[
          {
            key: 'driver',
            header: 'Driver',
            render: (s) => {
              const driver = asDriver(s.driverId);
              return (
                <div>
                  <CellPrimary>{driver?.name?.trim() || 'Driver'}</CellPrimary>
                  <CellSecondary>{formatPhone(driver?.phone)}</CellSecondary>
                </div>
              );
            },
          },
          {
            key: 'plan',
            header: 'Plan',
            render: (s) => {
              const plan = asPlan(s.planId);
              return (
                <div>
                  <CellPrimary>{plan?.name ?? '—'}</CellPrimary>
                  <CellSecondary>
                    {formatMoney(plan?.amount)}
                    {plan?.durationDays ? ` · ${plan.durationDays} days` : ''}
                  </CellSecondary>
                </div>
              );
            },
          },
          {
            key: 'vehicle',
            header: 'Vehicle',
            render: (s) => {
              const driver = asDriver(s.driverId);
              return driver?.vehicleType ?? s.vehicleType;
            },
          },
          {
            key: 'status',
            header: 'Status',
            render: (s) => <StatusBadge status={s.status} />,
          },
          {
            key: 'paidOn',
            header: 'Paid on',
            render: (s) =>
              s.status === 'PAID' ? formatDateTime(s.validFrom ?? s.createdAt) : '—',
          },
          {
            key: 'validUntil',
            header: 'Valid until',
            render: (s) =>
              s.validUntil ? <CellPrimary>{formatDateTime(s.validUntil)}</CellPrimary> : '—',
          },
          {
            key: 'paymentId',
            header: 'Payment ID',
            render: (s) => {
              const id = s.providerPaymentId ?? s.razorpayPaymentId;
              return id ? <CellMono>{id}</CellMono> : '—';
            },
          },
        ]}
      />
    </div>
  );
}
