import { FormEvent, useEffect, useState } from 'react';
import { MapPin, Palette, ImageIcon, Type } from 'lucide-react';
import { AppSettings, DEFAULT_APP_SETTINGS } from '@useme/shared';
import { api } from '../api/client';
import { useAppConfig } from '../config/AppConfigContext';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import Label from '../components/ui/Label';

type ThemeKey = keyof AppSettings['theme'];

const THEME_FIELDS: { key: ThemeKey; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'primaryDark', label: 'Primary dark' },
  { key: 'accent', label: 'Accent' },
  { key: 'buttonPrimary', label: 'Button' },
  { key: 'buttonPrimaryText', label: 'Button text' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'textPrimary', label: 'Text' },
  { key: 'textMuted', label: 'Muted text' },
  { key: 'borderFocused', label: 'Focus border' },
  { key: 'borderDefault', label: 'Default border' },
  { key: 'danger', label: 'Danger' },
  { key: 'warning', label: 'Warning' },
];

export default function Settings() {
  const { refresh } = useAppConfig();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AppSettings>('/admin/settings')
      .then((r) => setSettings(r.data))
      .finally(() => setLoading(false));
  }, []);

  function updateBranding<K extends keyof AppSettings['branding']>(
    key: K,
    value: AppSettings['branding'][K],
  ) {
    setSettings((s) => ({
      ...s,
      branding: { ...s.branding, [key]: value },
    }));
  }

  function updateTheme(key: ThemeKey, value: string) {
    setSettings((s) => ({
      ...s,
      theme: { ...s.theme, [key]: value },
    }));
  }

  function updateLogo<K extends keyof AppSettings['logos']>(
    key: K,
    value: AppSettings['logos'][K],
  ) {
    setSettings((s) => ({
      ...s,
      logos: { ...s.logos, [key]: value },
    }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    await api.patch('/admin/settings', settings);
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Settings" subtitle="Loading configuration…" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="White-label branding, theme colors, and platform behaviour"
      />

      <form onSubmit={save} className="max-w-3xl space-y-6">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-600">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">App names & copy</h3>
              <p className="text-sm text-slate-500">Shown across customer, driver, and admin apps</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Label>
              Customer app name
              <Input
                value={settings.branding.appName}
                onChange={(e) => updateBranding('appName', e.target.value)}
              />
            </Label>
            <Label>
              Driver app name
              <Input
                value={settings.branding.driverAppName}
                onChange={(e) => updateBranding('driverAppName', e.target.value)}
              />
            </Label>
            <Label>
              Admin title
              <Input
                value={settings.branding.adminTitle}
                onChange={(e) => updateBranding('adminTitle', e.target.value)}
              />
            </Label>
            <Label>
              Tagline
              <Input
                value={settings.branding.tagline}
                onChange={(e) => updateBranding('tagline', e.target.value)}
              />
            </Label>
            <Label>
              Customer subtitle
              <Input
                value={settings.branding.customerSubtitle}
                onChange={(e) => updateBranding('customerSubtitle', e.target.value)}
              />
            </Label>
            <Label>
              Driver subtitle
              <Input
                value={settings.branding.driverSubtitle}
                onChange={(e) => updateBranding('driverSubtitle', e.target.value)}
              />
            </Label>
            <Label className="sm:col-span-2">
              Support email
              <Input
                type="email"
                value={settings.branding.supportEmail}
                onChange={(e) => updateBranding('supportEmail', e.target.value)}
              />
            </Label>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-600">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Theme colors</h3>
              <p className="text-sm text-slate-500">Applied at runtime to all client apps</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {THEME_FIELDS.map(({ key, label }) => (
              <Label key={key}>
                {label}
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.theme[key]}
                    onChange={(e) => updateTheme(key, e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200"
                  />
                  <Input
                    value={settings.theme[key]}
                    onChange={(e) => updateTheme(key, e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </Label>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Logos</h3>
              <p className="text-sm text-slate-500">
                Public image URLs. Leave blank to use bundled defaults.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label>
              Full logo URL
              <Input
                value={settings.logos.logoUrl}
                onChange={(e) => updateLogo('logoUrl', e.target.value)}
                placeholder="https://…/logo.png"
              />
            </Label>
            <Label>
              Wordmark / icon URL
              <Input
                value={settings.logos.iconUrl}
                onChange={(e) => updateLogo('iconUrl', e.target.value)}
                placeholder="https://…/icon.png"
              />
            </Label>
            <Label>
              App icon URL
              <Input
                value={settings.logos.appIconUrl}
                onChange={(e) => updateLogo('appIconUrl', e.target.value)}
                placeholder="https://…/app-icon.png"
              />
            </Label>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Ride request radius</h3>
              <p className="text-sm text-slate-500">Distance filter for driver notifications</p>
            </div>
          </div>

          <Label>
            Radius (km)
            <Input
              type="number"
              value={settings.requestRadiusKm}
              onChange={(e) =>
                setSettings((s) => ({ ...s, requestRadiusKm: Number(e.target.value) }))
              }
            />
          </Label>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Drivers see open ride requests whose pickup is within this distance of their last known
            location.
          </p>
        </Card>

        <Button type="submit" variant={saved ? 'accent' : 'primary'} size="lg">
          {saved ? 'Saved ✓' : 'Save settings'}
        </Button>
      </form>
    </div>
  );
}
