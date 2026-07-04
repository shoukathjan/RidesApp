import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FlaskConical,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { logoSrc, useAppConfig } from '../config/AppConfigContext';
import Button from './ui/Button';
import { cn } from '../lib/cn';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/approvals', label: 'Driver Approvals', icon: UserCheck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/plans', label: 'Subscription Plans', icon: CreditCard },
  { to: '/fares', label: 'Fare Config', icon: IndianRupee },
  { to: '/subscriptions', label: 'Subscriptions', icon: Receipt },
  { to: '/payment-test', label: 'Payment Test', icon: FlaskConical },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const { config, apiOnline } = useAppConfig();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-gradient-to-b from-slate-900 via-brand-900 to-slate-950 text-white shadow-2xl shadow-slate-900/20">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex flex-col gap-2">
            <img
              src={logoSrc(config.logos.iconUrl, '/icon.png')}
              alt={config.branding.appName}
              className="h-8 w-auto object-contain"
            />
            <p className="text-xs font-medium text-white/60">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white/15 text-white shadow-inner shadow-white/5'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <l.icon className="h-4 w-4 shrink-0 opacity-90" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Button
            variant="accent"
            className="w-full"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen flex-1">
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,94,120,0.06),transparent_45%)]" />
          <div className="relative mx-auto max-w-7xl px-8 py-8">
            {!apiOnline ? (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Cannot reach the API at{' '}
                <code className="rounded bg-amber-100 px-1.5 py-0.5">
                  {import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'}
                </code>
                . Start the backend with <code className="rounded bg-amber-100 px-1.5 py-0.5">npm run backend</code>{' '}
                or run both services with{' '}
                <code className="rounded bg-amber-100 px-1.5 py-0.5">npm run dev:stack</code>.
              </div>
            ) : null}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
