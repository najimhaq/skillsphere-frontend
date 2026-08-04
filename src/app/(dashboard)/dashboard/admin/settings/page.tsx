'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  CircleDollarSign,
  CircleOff,
  LoaderCircle,
  Mail,
  Save,
  Settings2,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  Wrench,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type PlatformCurrency = 'USD' | 'BDT' | 'EUR' | 'GBP';

type PlatformSettings = {
  id: string;
  platformName: string;
  supportEmail: string;
  defaultCurrency: PlatformCurrency;
  allowNewEnrollments: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  updatedAt: string;
};

type SettingsResponse = {
  success: true;
  message?: string;
  data: PlatformSettings;
};

type FailedResponse = {
  success: false;
  message?: string;
};

const currencyOptions: Array<{
  value: PlatformCurrency;
  label: string;
}> = [
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'BDT', label: 'BDT — Bangladeshi Taka (৳)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
];

const getErrorMessage = (result: unknown, fallback: string) => {
  if (
    typeof result === 'object' &&
    result !== null &&
    'message' in result &&
    typeof result.message === 'string'
  ) {
    return result.message;
  }

  return fallback;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [defaultCurrency, setDefaultCurrency] =
    useState<PlatformCurrency>('USD');
  const [allowNewEnrollments, setAllowNewEnrollments] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/settings`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        });

        const result = (await response.json()) as
          | SettingsResponse
          | FailedResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            getErrorMessage(result, 'Unable to load platform settings.')
          );
        }

        setSettings(result.data);
        setPlatformName(result.data.platformName);
        setSupportEmail(result.data.supportEmail);
        setDefaultCurrency(result.data.defaultCurrency);
        setAllowNewEnrollments(result.data.allowNewEnrollments);
        setMaintenanceMode(result.data.maintenanceMode);
        setMaintenanceMessage(result.data.maintenanceMessage);
        setError('');
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load platform settings.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      controller.abort();
    };
  }, []);

  const hasChanges =
    settings !== null &&
    (platformName.trim() !== settings.platformName ||
      supportEmail.trim().toLowerCase() !== settings.supportEmail ||
      defaultCurrency !== settings.defaultCurrency ||
      allowNewEnrollments !== settings.allowNewEnrollments ||
      maintenanceMode !== settings.maintenanceMode ||
      maintenanceMessage.trim() !== settings.maintenanceMessage);

  const saveSettings = async () => {
    if (!settings || isSaving) {
      return;
    }

    const normalizedPlatformName = platformName.trim();
    const normalizedSupportEmail = supportEmail.trim().toLowerCase();
    const normalizedMaintenanceMessage = maintenanceMessage.trim();

    if (normalizedPlatformName.length < 2) {
      setError('Platform name must be at least 2 characters.');
      setSuccessMessage('');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedSupportEmail)) {
      setError('Please enter a valid support email address.');
      setSuccessMessage('');
      return;
    }

    if (
      normalizedMaintenanceMessage.length < 5 ||
      normalizedMaintenanceMessage.length > 500
    ) {
      setError('Maintenance message must be between 5 and 500 characters.');
      setSuccessMessage('');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platformName: normalizedPlatformName,
          supportEmail: normalizedSupportEmail,
          defaultCurrency,
          allowNewEnrollments,
          maintenanceMode,
          maintenanceMessage: normalizedMaintenanceMessage,
        }),
      });

      const result = (await response.json()) as
        | SettingsResponse
        | FailedResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(result, 'Unable to update platform settings.')
        );
      }

      setSettings(result.data);
      setPlatformName(result.data.platformName);
      setSupportEmail(result.data.supportEmail);
      setDefaultCurrency(result.data.defaultCurrency);
      setAllowNewEnrollments(result.data.allowNewEnrollments);
      setMaintenanceMode(result.data.maintenanceMode);
      setMaintenanceMessage(result.data.maintenanceMessage);

      setSuccessMessage(
        result.message || 'Platform settings updated successfully.'
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update platform settings.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='grid min-h-96 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading platform settings...
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className='mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Unable to load settings</p>
            <p className='mt-1'>
              {error || 'Platform settings could not be found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-5xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-indigo-600'>
            Administration
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Platform settings
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Manage platform identity, enrollment access, and maintenance
            settings.
          </p>
        </div>

        <button
          type='button'
          onClick={() => void saveSettings()}
          disabled={!hasChanges || isSaving}
          className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isSaving ? (
            <LoaderCircle className='h-4 w-4 animate-spin' />
          ) : (
            <Save className='h-4 w-4' />
          )}

          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Settings update failed</p>
            <p className='mt-1'>{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className='mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800'>
          <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-emerald-600' />

          <p>{successMessage}</p>
        </div>
      )}

      <div className='mt-6 space-y-6'>
        <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex items-center gap-2'>
            <Settings2 className='h-5 w-5 text-indigo-600' />

            <div>
              <h2 className='text-lg font-bold text-slate-900'>
                General information
              </h2>

              <p className='mt-1 text-sm text-slate-500'>
                These details represent your learning platform.
              </p>
            </div>
          </div>

          <div className='mt-6 grid gap-5 sm:grid-cols-2'>
            <label>
              <span className='text-sm font-bold text-slate-800'>
                Platform name
              </span>

              <input
                value={platformName}
                onChange={(event) => setPlatformName(event.target.value)}
                maxLength={100}
                disabled={isSaving}
                className='mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
              />
            </label>

            <label>
              <span className='flex items-center gap-2 text-sm font-bold text-slate-800'>
                <Mail className='h-4 w-4 text-slate-500' />
                Support email
              </span>

              <input
                type='email'
                value={supportEmail}
                onChange={(event) => setSupportEmail(event.target.value)}
                maxLength={254}
                disabled={isSaving}
                className='mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
              />
            </label>

            <label className='sm:col-span-2'>
              <span className='flex items-center gap-2 text-sm font-bold text-slate-800'>
                <CircleDollarSign className='h-4 w-4 text-slate-500' />
                Default currency
              </span>

              <select
                value={defaultCurrency}
                onChange={(event) =>
                  setDefaultCurrency(event.target.value as PlatformCurrency)
                }
                disabled={isSaving}
                className='mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
              >
                {currencyOptions.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex items-center gap-2'>
            <BellRing className='h-5 w-5 text-indigo-600' />

            <div>
              <h2 className='text-lg font-bold text-slate-900'>
                Enrollment access
              </h2>

              <p className='mt-1 text-sm text-slate-500'>
                Control whether students can enroll in new courses.
              </p>
            </div>
          </div>

          <div className='mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='font-bold text-slate-800'>Allow new enrollments</p>

              <p className='mt-1 text-sm leading-6 text-slate-500'>
                When disabled, students cannot create new course enrollments.
                Existing enrolled students keep their access.
              </p>
            </div>

            <button
              type='button'
              role='switch'
              aria-checked={allowNewEnrollments}
              onClick={() =>
                setAllowNewEnrollments((currentValue) => !currentValue)
              }
              disabled={isSaving}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                allowNewEnrollments
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {allowNewEnrollments ? (
                <ToggleRight className='h-6 w-6' />
              ) : (
                <ToggleLeft className='h-6 w-6' />
              )}

              {allowNewEnrollments ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </section>

        <section
          className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
            maintenanceMode
              ? 'border-amber-300 bg-amber-50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className='flex items-start gap-3'>
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                maintenanceMode
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Wrench className='h-5 w-5' />
            </div>

            <div>
              <h2 className='text-lg font-bold text-slate-900'>
                Maintenance mode
              </h2>

              <p className='mt-1 text-sm leading-6 text-slate-600'>
                Use this when you need to announce scheduled maintenance or
                temporarily restrict public platform access.
              </p>
            </div>
          </div>

          <div className='mt-6 flex flex-col gap-4 rounded-xl border border-amber-200 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='flex items-center gap-2 font-bold text-slate-800'>
                <ShieldAlert className='h-4 w-4 text-amber-700' />
                Public maintenance mode
              </p>

              <p className='mt-1 text-sm leading-6 text-slate-500'>
                Current status:{' '}
                <span className='font-bold text-slate-700'>
                  {maintenanceMode ? 'Enabled' : 'Disabled'}
                </span>
              </p>
            </div>

            <button
              type='button'
              role='switch'
              aria-checked={maintenanceMode}
              onClick={() =>
                setMaintenanceMode((currentValue) => !currentValue)
              }
              disabled={isSaving}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                maintenanceMode
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {maintenanceMode ? (
                <ToggleRight className='h-6 w-6' />
              ) : (
                <ToggleLeft className='h-6 w-6' />
              )}

              {maintenanceMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <label className='mt-5 block'>
            <span className='text-sm font-bold text-slate-800'>
              Maintenance message
            </span>

            <textarea
              value={maintenanceMessage}
              onChange={(event) => setMaintenanceMessage(event.target.value)}
              rows={4}
              maxLength={500}
              disabled={isSaving}
              className='mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
              placeholder='Write the maintenance message shown to visitors...'
            />
          </label>

          <div className='mt-1 flex justify-end'>
            <span className='text-xs text-slate-500'>
              {maintenanceMessage.trim().length}/500
            </span>
          </div>
        </section>

        <section className='rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>
          <p>
            Last saved:{' '}
            <span className='font-semibold text-slate-800'>
              {formatDateTime(settings.updatedAt)}
            </span>
          </p>

          <p className='mt-1 leading-6'>
            Every successful settings update is recorded in the Admin Activity
            Log.
          </p>
        </section>
      </div>
    </div>
  );
}
