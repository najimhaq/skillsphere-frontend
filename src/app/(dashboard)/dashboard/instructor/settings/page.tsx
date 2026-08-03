'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  BookCheck,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';

import {
  getInstructorProfile,
  updateInstructorSettings,
  type InstructorProfileResponse,
  type InstructorSettings,
} from '@/lib/instructor-profile-api';

type SettingItemProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? 'bg-indigo-600' : 'bg-slate-200'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

function SettingItem({
  title,
  description,
  icon: Icon,
  checked,
  disabled,
  onChange,
}: SettingItemProps) {
  return (
    <div className='flex items-start gap-4 py-5 first:pt-0 last:pb-0'>
      <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600'>
        <Icon className='h-5 w-5' />
      </div>

      <div className='min-w-0 flex-1'>
        <h3 className='text-sm font-bold text-slate-900'>{title}</h3>

        <p className='mt-1 text-sm leading-6 text-slate-500'>{description}</p>
      </div>

      <Toggle checked={checked} disabled={disabled} onChange={onChange} />
    </div>
  );
}

export default function InstructorSettingsPage() {
  const [data, setData] = useState<InstructorProfileResponse | null>(null);
  const [settings, setSettings] = useState<InstructorSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const result = await getInstructorProfile();

        if (!isMounted) {
          return;
        }

        setData(result);
        setSettings(result.settings);
        setError('');
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load settings.'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const changeSetting = <Key extends keyof InstructorSettings>(
    key: Key,
    value: InstructorSettings[Key]
  ) => {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });

    setSuccessMessage('');
  };

  const saveSettings = async () => {
    if (!settings) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await updateInstructorSettings(settings);

      setData(result);
      setSettings(result.settings);
      setSuccessMessage('Notification preferences saved successfully.');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to save settings.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className='grid min-h-96 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading your settings...
        </div>
      </div>
    );
  }

  if (!data || !settings) {
    return (
      <div className='rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
          <div>
            <p className='font-bold'>Unable to load your settings</p>
            <p className='mt-1'>{error || 'Please refresh and try again.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-5xl'>
      <section className='border-b border-slate-200 pb-8'>
        <p className='text-sm font-semibold text-indigo-600'>
          Instructor dashboard
        </p>

        <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
          Settings
        </h1>

        <p className='mt-2 text-sm leading-6 text-slate-600'>
          Control your instructor account and notification preferences.
        </p>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className='mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
          <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' />
          <p>{successMessage}</p>
        </div>
      )}

      <div className='mt-7 space-y-6'>
        <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-100 p-5 sm:p-6'>
            <div className='flex items-start gap-3'>
              <div className='grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600'>
                <Bell className='h-5 w-5' />
              </div>

              <div>
                <h2 className='text-lg font-bold text-slate-900'>
                  Notifications
                </h2>

                <p className='mt-1 text-sm leading-6 text-slate-500'>
                  Choose which instructor activity updates should be sent to
                  your email.
                </p>
              </div>
            </div>
          </div>

          <div className='divide-y divide-slate-100 p-5 sm:p-6'>
            <SettingItem
              title='New enrollments'
              description='Get notified when a student enrolls in one of your courses.'
              icon={CircleDollarSign}
              checked={settings.notifyNewEnrollment}
              disabled={isSaving}
              onChange={(value) => changeSetting('notifyNewEnrollment', value)}
            />

            <SettingItem
              title='Course review updates'
              description='Receive updates when an admin approves or requests changes to a course.'
              icon={BookCheck}
              checked={settings.notifyCourseReview}
              disabled={isSaving}
              onChange={(value) => changeSetting('notifyCourseReview', value)}
            />

            <SettingItem
              title='Student completions'
              description='Get notified when a student completes one of your courses.'
              icon={UserRoundCheck}
              checked={settings.notifyStudentCompletion}
              disabled={isSaving}
              onChange={(value) =>
                changeSetting('notifyStudentCompletion', value)
              }
            />
          </div>

          <div className='flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
            <p className='text-xs text-slate-500'>
              Notifications are sent to {data.user.email}.
            </p>

            <button
              type='button'
              onClick={saveSettings}
              disabled={isSaving}
              className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSaving ? (
                <LoaderCircle className='h-4 w-4 animate-spin' />
              ) : (
                <CheckCircle2 className='h-4 w-4' />
              )}

              {isSaving ? 'Saving...' : 'Save preferences'}
            </button>
          </div>
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-100 p-5 sm:p-6'>
            <div className='flex items-start gap-3'>
              <div className='grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600'>
                <ShieldCheck className='h-5 w-5' />
              </div>

              <div>
                <h2 className='text-lg font-bold text-slate-900'>
                  Account security
                </h2>

                <p className='mt-1 text-sm leading-6 text-slate-500'>
                  Password and sign-in security are managed by your
                  authentication provider.
                </p>
              </div>
            </div>
          </div>

          <div className='p-5 sm:p-6'>
            <div className='flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-start gap-3'>
                <div className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-slate-600 shadow-sm'>
                  <KeyRound className='h-5 w-5' />
                </div>

                <div>
                  <h3 className='text-sm font-bold text-slate-900'>
                    Change password
                  </h3>

                  <p className='mt-1 text-sm leading-6 text-slate-500'>
                    Use the account security flow to update your password
                    securely.
                  </p>
                </div>
              </div>

              <button
                type='button'
                disabled
                title='Password change flow will be connected in the next step.'
                className='inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400 shadow-sm'
              >
                Manage password
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex items-start gap-3'>
            <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-600'>
              <Mail className='h-5 w-5' />
            </div>

            <div>
              <h2 className='text-lg font-bold text-slate-900'>
                Account email
              </h2>

              <p className='mt-1 text-sm leading-6 text-slate-500'>
                Your current sign-in email is{' '}
                <span className='font-semibold text-slate-700'>
                  {data.user.email}
                </span>
                . Email changes will be added through a verified account update
                flow later.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
