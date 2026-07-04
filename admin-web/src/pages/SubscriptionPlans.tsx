import { VehicleType, VEHICLE_TYPES } from '@useme/shared';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../api/client';
import DataTable, { CellPrimary } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import Label from '../components/ui/Label';
import { formatMoney } from '../lib/format';

interface Plan {
  _id: string;
  vehicleType: VehicleType;
  name: string;
  amount: number;
  durationDays: number;
  active: boolean;
}

const emptyForm = {
  vehicleType: VehicleType.AUTO,
  name: '',
  amount: 0,
  durationDays: 30,
};

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<Plan[]>('/admin/plans')
      .then((r) => setPlans(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createPlan(e: FormEvent) {
    e.preventDefault();
    await api.post('/admin/plans', {
      ...form,
      amount: Number(form.amount),
      durationDays: Number(form.durationDays),
    });
    setForm(emptyForm);
    load();
  }

  async function remove(id: string) {
    await api.delete(`/admin/plans/${id}`);
    load();
  }

  async function toggle(plan: Plan) {
    await api.patch(`/admin/plans/${plan._id}`, { active: !plan.active });
    load();
  }

  const activeCount = plans.filter((p) => p.active).length;

  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        subtitle={`${plans.length} plans · ${activeCount} active`}
      />

      <Card className="mb-6">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Create plan (per vehicle type)</h3>
        <form onSubmit={createPlan} className="flex flex-wrap items-end gap-4">
          <Label className="min-w-[120px]">
            Vehicle
            <Select
              value={form.vehicleType}
              onChange={(e) =>
                setForm({ ...form, vehicleType: e.target.value as VehicleType })
              }
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Label>
          <Label className="min-w-[160px]">
            Name
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Label>
          <Label className="min-w-[120px]">
            Amount (INR)
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </Label>
          <Label className="min-w-[120px]">
            Duration (days)
            <Input
              type="number"
              value={form.durationDays}
              onChange={(e) =>
                setForm({ ...form, durationDays: Number(e.target.value) })
              }
            />
          </Label>
          <Button type="submit">
            <Plus className="h-4 w-4" />
            Add plan
          </Button>
        </form>
      </Card>

      <DataTable
        loading={loading}
        rows={plans}
        rowKey={(p) => p._id}
        emptyMessage="No plans yet. Create one above."
        columns={[
          { key: 'vehicle', header: 'Vehicle', render: (p) => p.vehicleType },
          { key: 'name', header: 'Plan name', render: (p) => <CellPrimary>{p.name}</CellPrimary> },
          { key: 'amount', header: 'Amount', render: (p) => formatMoney(p.amount), align: 'right' },
          { key: 'duration', header: 'Duration', render: (p) => `${p.durationDays} days` },
          {
            key: 'active',
            header: 'Status',
            render: (p) => <StatusBadge status={p.active ? 'ACTIVE' : 'INACTIVE'} />,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (p) => (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => toggle(p)}>
                  {p.active ? 'Disable' : 'Enable'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => remove(p._id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
