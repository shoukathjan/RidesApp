import { cn } from '../lib/cn';

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const LABELS: Record<string, string> = {
  PAID: 'Paid',
  CREATED: 'Pending payment',
  FAILED: 'Failed',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  EXPIRED: 'Expired',
  NONE: 'No subscription',
};

const TONES: Record<string, BadgeTone> = {
  PAID: 'success',
  CREATED: 'warning',
  FAILED: 'danger',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  ONLINE: 'success',
  OFFLINE: 'neutral',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  EXPIRED: 'danger',
  NONE: 'neutral',
};

const toneClass: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

export default function StatusBadge({ status }: { status: string }) {
  const tone = TONES[status] ?? 'neutral';
  const label = LABELS[status] ?? status;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        toneClass[tone],
      )}
    >
      {label}
    </span>
  );
}
