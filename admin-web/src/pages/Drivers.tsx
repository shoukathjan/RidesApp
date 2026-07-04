import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import DataTable, { CellPrimary, CellSecondary } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/ui/Button';
import {
  formatDateTime,
  formatPhone,
  subscriptionActive,
} from '../lib/format';

interface DriverRow {
  _id: string;
  name?: string;
  phone: string;
  vehicleType: string;
  approvalStatus: string;
  onlineStatus: string;
  subscriptionValidUntil: string | null;
  createdAt?: string;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<DriverRow[]>('/admin/drivers')
      .then((r) => setDrivers(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(driver: DriverRow) {
    const label = driver.name?.trim() || formatPhone(driver.phone);
    if (
      !window.confirm(
        `Delete driver "${label}"?\n\nThis removes their account, subscriptions, and cancels any open rides. They can register again with the same phone.`,
      )
    ) {
      return;
    }
    setDeletingId(driver._id);
    try {
      await api.delete(`/admin/drivers/${driver._id}`);
      load();
    } finally {
      setDeletingId(null);
    }
  }

  const activeSubs = drivers.filter((d) =>
    subscriptionActive(d.subscriptionValidUntil),
  ).length;

  return (
    <div>
      <PageHeader
        title="Drivers"
        subtitle={`${drivers.length} registered · ${activeSubs} with active subscription`}
      />

      <DataTable
        loading={loading}
        rows={drivers}
        rowKey={(d) => d._id}
        emptyMessage="No drivers registered yet."
        columns={[
          {
            key: 'driver',
            header: 'Driver',
            render: (d) => (
              <div>
                <CellPrimary>{d.name?.trim() || '—'}</CellPrimary>
                <CellSecondary>{formatPhone(d.phone)}</CellSecondary>
              </div>
            ),
          },
          {
            key: 'vehicle',
            header: 'Vehicle',
            render: (d) => d.vehicleType,
          },
          {
            key: 'approval',
            header: 'Approval',
            render: (d) => <StatusBadge status={d.approvalStatus} />,
          },
          {
            key: 'online',
            header: 'Online',
            render: (d) => <StatusBadge status={d.onlineStatus} />,
          },
          {
            key: 'subscription',
            header: 'Subscription',
            render: (d) => {
              const active = subscriptionActive(d.subscriptionValidUntil);
              return (
                <StatusBadge status={active ? 'ACTIVE' : d.subscriptionValidUntil ? 'EXPIRED' : 'NONE'} />
              );
            },
          },
          {
            key: 'validUntil',
            header: 'Valid until',
            render: (d) => formatDateTime(d.subscriptionValidUntil),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (d) => (
              <Button
                size="sm"
                variant="danger"
                disabled={deletingId === d._id}
                onClick={() => remove(d)}
              >
                {deletingId === d._id ? 'Deleting…' : 'Delete'}
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
