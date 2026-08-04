'use client';

import { useEffect, useState, type ElementType, type FormEvent } from 'react';
import {
  AlertCircle,
  Bell,
  BookCheck,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRoundCheck,
  X,
} from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import {
  getInstructorProfile,
  updateInstructorSettings,
  type InstructorProfileResponse,
  type InstructorSettings,
} from '@/lib/instructor-profile-api';

type SettingItemProps = {
  title: string;
  description: string;
  icon: ElementType;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions: boolean;
};

const emptyPasswordForm: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  revokeOtherSessions: true,
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

function PasswordInput({
  id,
  label,
  value,
  placeholder,
  autoComplete,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className='block' htmlFor={id}>
      <span className='text-sm font-semibold text-slate-700'>{label}</span>

      <div className='relative mt-2'>
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className='h-11 w-full rounded-xl border border-slate-200 px-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
        />

        <button
          type='button'
          onClick={() => setIsVisible((current) => !current)}
          disabled={disabled}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className='absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed'
        >
          {isVisible ? (
            <EyeOff className='h-4 w-4' />
          ) : (
            <Eye className='h-4 w-4' />
          )}
        </button>
      </div>
    </label>
  );
}

export default function InstructorSettingsPage() {
  const [data, setData] = useState<InstructorProfileResponse | null>(null);
  const [settings, setSettings] = useState<InstructorSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(emptyPasswordForm);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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

    setIsSavingSettings(true);
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
      setIsSavingSettings(false);
    }
  };

  const openPasswordModal = () => {
    setPasswordForm(emptyPasswordForm);
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (isChangingPassword) {
      return;
    }

    setPasswordForm(emptyPasswordForm);
    setPasswordError('');
    setIsPasswordModalOpen(false);
  };

  const updatePasswordField = <Key extends keyof PasswordForm>(
    key: Key,
    value: PasswordForm[Key]
  ) => {
    setPasswordForm((current) => ({
      ...current,
      [key]: value,
    }));

    setPasswordError('');
  };

  const getAuthErrorMessage = (caughtError: unknown) => {
    if (caughtError instanceof Error) {
      return caughtError.message;
    }

    if (
      typeof caughtError === 'object' &&
      caughtError !== null &&
      'message' in caughtError &&
      typeof caughtError.message === 'string'
    ) {
      return caughtError.message;
    }

    return 'Unable to change your password. Please try again.';
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentPassword = passwordForm.currentPassword;
    const newPassword = passwordForm.newPassword;
    const confirmPassword = passwordForm.confirmPassword;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please complete all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Your new password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        'Your new password must be different from your current password.'
      );
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: passwordForm.revokeOtherSessions,
      });

      if (result.error) {
        setPasswordError(
          result.error.message || 'Unable to change your password.'
        );
        return;
      }

      setIsPasswordModalOpen(false);
      setPasswordForm(emptyPasswordForm);
      setSuccessMessage(
        passwordForm.revokeOtherSessions
          ? 'Password changed successfully. Other active sessions were signed out.'
          : 'Password changed successfully.'
      );
    } catch (caughtError) {
      setPasswordError(getAuthErrorMessage(caughtError));
    } finally {
      setIsChangingPassword(false);
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
    <>
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
                disabled={isSavingSettings}
                onChange={(value) =>
                  changeSetting('notifyNewEnrollment', value)
                }
              />

              <SettingItem
                title='Course review updates'
                description='Receive updates when an admin approves or requests changes to a course.'
                icon={BookCheck}
                checked={settings.notifyCourseReview}
                disabled={isSavingSettings}
                onChange={(value) => changeSetting('notifyCourseReview', value)}
              />

              <SettingItem
                title='Student completions'
                description='Get notified when a student completes one of your courses.'
                icon={UserRoundCheck}
                checked={settings.notifyStudentCompletion}
                disabled={isSavingSettings}
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
                disabled={isSavingSettings}
                className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSavingSettings ? (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                ) : (
                  <CheckCircle2 className='h-4 w-4' />
                )}

                {isSavingSettings ? 'Saving...' : 'Save preferences'}
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
                    Protect your account by updating your password regularly.
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
                      Verify your current password before choosing a new one.
                    </p>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={openPasswordModal}
                  className='inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50'
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
                  . Email changes will be added through a verified account
                  update flow later.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm'
          role='dialog'
          aria-modal='true'
          aria-labelledby='change-password-title'
        >
          <div className='w-full max-w-md rounded-2xl bg-white shadow-2xl'>
            <div className='flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6'>
              <div className='flex items-start gap-3'>
                <div className='grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600'>
                  <LockKeyhole className='h-5 w-5' />
                </div>

                <div>
                  <h2
                    id='change-password-title'
                    className='text-lg font-bold text-slate-900'
                  >
                    Change password
                  </h2>

                  <p className='mt-1 text-sm text-slate-500'>
                    Choose a strong password you do not use elsewhere.
                  </p>
                </div>
              </div>

              <button
                type='button'
                onClick={closePasswordModal}
                disabled={isChangingPassword}
                aria-label='Close password dialog'
                className='grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className='space-y-5 p-5 sm:p-6'>
                {passwordError && (
                  <div className='flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700'>
                    <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
                    <p>{passwordError}</p>
                  </div>
                )}

                <PasswordInput
                  id='current-password'
                  label='Current password'
                  value={passwordForm.currentPassword}
                  placeholder='Enter your current password'
                  autoComplete='current-password'
                  disabled={isChangingPassword}
                  onChange={(value) =>
                    updatePasswordField('currentPassword', value)
                  }
                />

                <PasswordInput
                  id='new-password'
                  label='New password'
                  value={passwordForm.newPassword}
                  placeholder='At least 8 characters'
                  autoComplete='new-password'
                  disabled={isChangingPassword}
                  onChange={(value) =>
                    updatePasswordField('newPassword', value)
                  }
                />

                <PasswordInput
                  id='confirm-password'
                  label='Confirm new password'
                  value={passwordForm.confirmPassword}
                  placeholder='Re-enter your new password'
                  autoComplete='new-password'
                  disabled={isChangingPassword}
                  onChange={(value) =>
                    updatePasswordField('confirmPassword', value)
                  }
                />

                <label className='flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5'>
                  <input
                    type='checkbox'
                    checked={passwordForm.revokeOtherSessions}
                    disabled={isChangingPassword}
                    onChange={(event) =>
                      updatePasswordField(
                        'revokeOtherSessions',
                        event.target.checked
                      )
                    }
                    className='mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed'
                  />

                  <span>
                    <span className='block text-sm font-semibold text-slate-800'>
                      Sign out from other devices
                    </span>

                    <span className='mt-1 block text-xs leading-5 text-slate-500'>
                      We will keep this browser signed in and sign out your
                      other active sessions.
                    </span>
                  </span>
                </label>
              </div>

              <div className='flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6'>
                <button
                  type='button'
                  onClick={closePasswordModal}
                  disabled={isChangingPassword}
                  className='inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  Cancel
                </button>

                <button
                  type='submit'
                  disabled={isChangingPassword}
                  className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {isChangingPassword ? (
                    <LoaderCircle className='h-4 w-4 animate-spin' />
                  ) : (
                    <KeyRound className='h-4 w-4' />
                  )}

                  {isChangingPassword
                    ? 'Changing password...'
                    : 'Change password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
