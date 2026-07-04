import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  icon?: LucideIcon;
}

const toneStyles = {
  primary: {
    card: 'from-brand-500/10 to-brand-500/5 ring-brand-500/20',
    icon: 'bg-brand-500/15 text-brand-600',
    value: 'text-brand-700',
  },
  success: {
    card: 'from-emerald-500/10 to-emerald-500/5 ring-emerald-500/20',
    icon: 'bg-emerald-500/15 text-emerald-600',
    value: 'text-emerald-700',
  },
  warning: {
    card: 'from-amber-500/10 to-amber-500/5 ring-amber-500/20',
    icon: 'bg-amber-500/15 text-amber-600',
    value: 'text-amber-700',
  },
  danger: {
    card: 'from-red-500/10 to-red-500/5 ring-red-500/20',
    icon: 'bg-red-500/15 text-red-600',
    value: 'text-red-700',
  },
  neutral: {
    card: 'from-slate-500/10 to-slate-500/5 ring-slate-500/15',
    icon: 'bg-slate-500/15 text-slate-600',
    value: 'text-slate-700',
  },
};

export default function StatCard({
  label,
  value,
  hint,
  tone = 'primary',
  icon: Icon,
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 ring-1 ring-inset',
        'shadow-sm shadow-slate-200/50 transition-all hover:-translate-y-0.5 hover:shadow-md',
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className={cn('mt-2 text-3xl font-extrabold tracking-tight', styles.value)}>{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('rounded-xl p-2.5', styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
