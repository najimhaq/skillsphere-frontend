'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { authClient } from '@/lib/auth-client';

export default function StudentSettingsPage() {
  const router = useRouter();
  const {
    data: session,
    isPending,
    refetch: refetchSession,
  } = authClient.useSession();

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace('/sign-in');
    }
  }, [isPending, router, session?.user]);

  const profileName = name || session?.user?.name || '';

  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const normalizedName = profileName.trim();

    if (normalizedName.length < 2) {
      toast.error('Name must contain at least 2 characters.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const { error } = await authClient.updateUser({
        name: normalizedName,
      });

      if (error) {
        toast.error(error.message ?? 'Unable to update your profile.');
        return;
      }

      await refetchSession();
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to update your profile.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message ?? 'Unable to change password.');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success(
        'Password updated. You have been signed out from other devices.'
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to change password.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message ?? 'Unable to sign out.');
        return;
      }

      toast.success('Signed out successfully.');
      router.replace('/');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to sign out.'
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <div className='grid min-h-80 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading account settings...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const role = session.user.role ?? 'STUDENT';

  return (
    <div className='mx-auto max-w-4xl'>
      <section className='border-b border-slate-200 pb-8'>
        <p className='text-sm font-semibold text-indigo-600'>
          Student dashboard
        </p>

        <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
          Account settings
        </h1>

        <p className='mt-2 text-sm leading-6 text-slate-600'>
          Manage your profile, account information, and account security.
        </p>
      </section>

      <section className='mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-start gap-3 border-b border-slate-100 px-6 py-5'>
          <div className='grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-600'>
            <UserRound className='h-5 w-5' />
          </div>

          <div>
            <h2 className='text-lg font-bold text-slate-900'>
              Profile information
            </h2>

            <p className='mt-1 text-sm text-slate-500'>
              Update the name displayed on your dashboard and certificates.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className='p-6'>
          <label className='block max-w-xl'>
            <span className='text-sm font-semibold text-slate-700'>
              Full name
            </span>

            <input
              type='text'
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={120}
              autoComplete='name'
              required
              className='mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
            />
          </label>

          <button
            type='submit'
            disabled={isSavingProfile}
            className='mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSavingProfile ? (
              <>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='h-4 w-4' />
                Save profile
              </>
            )}
          </button>
        </form>
      </section>

      <section className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-start gap-3 border-b border-slate-100 px-6 py-5'>
          <div className='grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-600'>
            <Mail className='h-5 w-5' />
          </div>

          <div>
            <h2 className='text-lg font-bold text-slate-900'>
              Account information
            </h2>

            <p className='mt-1 text-sm text-slate-500'>
              Your identity and account status on SkillSphere.
            </p>
          </div>
        </div>

        <dl className='divide-y divide-slate-100'>
          <div className='flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
            <dt className='text-sm font-medium text-slate-500'>
              Email address
            </dt>

            <dd className='text-sm font-semibold text-slate-900'>
              {session.user.email}
            </dd>
          </div>

          <div className='flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
            <dt className='text-sm font-medium text-slate-500'>Account role</dt>

            <dd className='inline-flex w-fit items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700'>
              {role}
            </dd>
          </div>

          <div className='flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
            <dt className='text-sm font-medium text-slate-500'>
              Email verification
            </dt>

            <dd
              className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                session.user.emailVerified
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <CheckCircle2 className='h-3.5 w-3.5' />
              {session.user.emailVerified ? 'Verified' : 'Not verified'}
            </dd>
          </div>

          <div className='flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
            <dt className='text-sm font-medium text-slate-500'>User ID</dt>

            <dd className='max-w-full truncate font-mono text-xs text-slate-600 sm:max-w-md'>
              {session.user.id}
            </dd>
          </div>
        </dl>
      </section>

      <section className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-start gap-3 border-b border-slate-100 px-6 py-5'>
          <div className='grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-600'>
            <KeyRound className='h-5 w-5' />
          </div>

          <div>
            <h2 className='text-lg font-bold text-slate-900'>
              Password and security
            </h2>

            <p className='mt-1 text-sm text-slate-500'>
              Change your password and sign out from all other devices.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className='p-6'>
          <div className='grid max-w-xl gap-4'>
            <label className='block'>
              <span className='text-sm font-semibold text-slate-700'>
                Current password
              </span>

              <input
                type='password'
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete='current-password'
                required
                className='mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />
            </label>

            <label className='block'>
              <span className='text-sm font-semibold text-slate-700'>
                New password
              </span>

              <input
                type='password'
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                autoComplete='new-password'
                required
                className='mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />
            </label>

            <label className='block'>
              <span className='text-sm font-semibold text-slate-700'>
                Confirm new password
              </span>

              <input
                type='password'
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                autoComplete='new-password'
                required
                className='mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />
            </label>
          </div>

          <div className='mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3'>
            <div className='flex gap-2 text-sm text-amber-800'>
              <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0' />

              <p>
                Changing your password will sign out all other active sessions
                for your account.
              </p>
            </div>
          </div>

          <button
            type='submit'
            disabled={isChangingPassword}
            className='mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isChangingPassword ? (
              <>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Updating password...
              </>
            ) : (
              <>
                <KeyRound className='h-4 w-4' />
                Change password
              </>
            )}
          </button>
        </form>
      </section>

      <section className='mt-6 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm'>
        <div className='flex items-start gap-3 border-b border-rose-100 px-6 py-5'>
          <div className='grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-600'>
            <LogOut className='h-5 w-5' />
          </div>

          <div>
            <h2 className='text-lg font-bold text-slate-900'>Sign out</h2>

            <p className='mt-1 text-sm text-slate-500'>
              End your current SkillSphere session on this device.
            </p>
          </div>
        </div>

        <div className='p-6'>
          <button
            type='button'
            onClick={handleSignOut}
            disabled={isSigningOut}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSigningOut ? (
              <>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className='h-4 w-4' />
                Sign out
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
