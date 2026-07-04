import { VehicleType, VEHICLE_TYPES } from '@useme/shared';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import DataTable, { CellPrimary } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatMoney } from '../lib/format';

interface FareRow {
  vehicleType: VehicleType;
  baseFare: number;
  perKmRate: number;
  active: boolean;
}

export default function FareConfig() {
  const [rows, setRows] = useState<Record<string, FareRow>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<FareRow[]>('/admin/fare-config')
      .then((r) => {
        const map: Record<string, FareRow> = {};
        for (const v of VEHICLE_TYPES) {
          map[v] = { vehicleType: v, baseFare: 0, perKmRate: 0, active: true };
        }
        r.data.forEach((row) => (map[row.vehicleType] = row));
        setRows(map);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function update(v: VehicleType, patch: Partial<FareRow>) {
    setRows((prev) => ({ ...prev, [v]: { ...prev[v], ...patch } }));
  }

  async function save(v: VehicleType) {
    const row = rows[v];
    await api.put('/admin/fare-config', {
      vehicleType: v,
      baseFare: Number(row.baseFare),
      perKmRate: Number(row.perKmRate),
      active: row.active,
    });
    load();
  }

  const tableRows = VEHICLE_TYPES.map((v) => rows[v]).filter(Boolean);

  return (
    <div>
      <PageHeader
        title="Fare Config"
        subtitle="Fare = base fare + per-km rate × straight-line distance, per vehicle type"
      />

      <DataTable
        loading={loading}
        rows={tableRows}
        rowKey={(r) => r.vehicleType}
        emptyMessage="No fare configuration found."
        columns={[
          {
            key: 'vehicle',
            header: 'Vehicle',
            render: (r) => <CellPrimary>{r.vehicleType}</CellPrimary>,
          },
          {
            key: 'baseFare',
            header: 'Base fare (INR)',
            render: (r) => (
              <Input
                type="number"
                className="h-9 w-28"
                value={r.baseFare}
                onChange={(e) => update(r.vehicleType, { baseFare: Number(e.target.value) })}
              />
            ),
          },
          {
            key: 'perKm',
            header: 'Per km (INR)',
            render: (r) => (
              <Input
                type="number"
                className="h-9 w-28"
                value={r.perKmRate}
                onChange={(e) => update(r.vehicleType, { perKmRate: Number(e.target.value) })}
              />
            ),
          },
          {
            key: 'example',
            header: 'Example (10 km)',
            render: (r) => formatMoney(r.baseFare + r.perKmRate * 10),
            align: 'right',
          },
          {
            key: 'active',
            header: 'Status',
            render: (r) => (
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                  checked={r.active}
                  onChange={(e) => update(r.vehicleType, { active: e.target.checked })}
                />
                <StatusBadge status={r.active ? 'ACTIVE' : 'INACTIVE'} />
              </label>
            ),
          },
          {
            key: 'action',
            header: 'Action',
            render: (r) => (
              <Button size="sm" onClick={() => save(r.vehicleType)}>
                Save
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
