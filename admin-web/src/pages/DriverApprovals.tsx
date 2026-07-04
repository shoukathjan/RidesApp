import { ApprovalStatus } from '@useme/shared';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import DataTable, { CellPrimary, CellSecondary } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import { formatPhone } from '../lib/format';
import { cn } from '../lib/cn';

interface DriverRow {
  _id: string;
  name?: string;
  phone: string;
  vehicleType: string;
  documents?: Record<string, string | undefined>;
  approvalStatus: ApprovalStatus;
}

const DOC_LABELS: Record<string, string> = {
  licenseUrl: 'License',
  rcUrl: 'RC',
  insuranceUrl: 'Insurance',
  profilePhotoUrl: 'Photo',
};

export default function DriverApprovals() {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<DriverRow[]>('/admin/drivers', {
        params: { approvalStatus: ApprovalStatus.PENDING },
      })
      .then((r) => setDrivers(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(id: string, action: 'approve' | 'reject') {
    await api.post(`/admin/drivers/${id}/${action}`);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Driver Approvals"
        subtitle={
          drivers.length === 0
            ? 'No pending registrations'
            : `${drivers.length} pending review`
        }
      />

      <DataTable
        loading={loading}
        rows={drivers}
        rowKey={(d) => d._id}
        emptyMessage="No pending registrations. New driver sign-ups will appear here."
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
            key: 'documents',
            header: 'Documents',
            render: (d) => {
              const docs = d.documents
                ? Object.entries(d.documents).filter(([, url]) => url)
                : [];
              if (docs.length === 0) return '—';
              return (
                <div className="flex flex-wrap gap-2">
                  {docs.map(([type, url]) => (
                    <a
                      key={type}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        'inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold',
                        'text-sky-700 ring-1 ring-sky-600/20 transition hover:bg-sky-100',
                      )}
                    >
                      {DOC_LABELS[type] ?? type}
                    </a>
                  ))}
                </div>
              );
            },
          },
          {
            key: 'actions',
            header: 'Action',
            render: (d) => (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decide(d._id, 'approve')}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => decide(d._id, 'reject')}>
                  Reject
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
