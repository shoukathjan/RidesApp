import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { logoSrc, useAppConfig } from '../config/AppConfigContext';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import Label from '../components/ui/Label';

export default function Login() {
  const { config } = useAppConfig();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@useme.app');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-slate-950 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,168,83,0.15),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(28,94,120,0.25),transparent_45%)]" />

      <Card className="relative w-full max-w-md border-white/20 bg-white/95 p-8 shadow-2xl shadow-slate-900/30 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <img
            src={logoSrc(config.logos.logoUrl, '/logo.png')}
            alt={config.branding.appName}
            className="mx-auto mb-4 h-28 w-auto max-w-full object-contain"
          />
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to the {config.branding.appName} admin console
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Label>
            Email
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </Label>
          <Label>
            Password
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </Label>
          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 ring-1 ring-red-200">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
