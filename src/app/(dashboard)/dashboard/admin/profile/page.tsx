// src/app/(dashboard)/dashboard/admin/profile/page.tsx
'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string | null;
  updatedAt: string | null;
};

type ProfileResponse = {
  success: true;
  message?: string;
  data: AdminProfile;
};

type FailedResponse = {
  success: false;
  message?: string;
};

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

const getInitials = (name: string) => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'A'
  );
};

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/profile`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        });

        const result = (await response.json()) as
          | ProfileResponse
          | FailedResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            getErrorMessage(result, 'Unable to load your profile.')
          );
        }

        setProfile(result.data);
        setName(result.data.name);
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
            : 'Unable to load your profile.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, []);

  const saveProfile = async () => {
    if (!profile || isSaving) {
      return;
    }

    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      setError('Name must be at least 2 characters.');
      setSuccessMessage('');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/api/admin/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: normalizedName,
        }),
      });

      const result = (await response.json()) as
        | ProfileResponse
        | FailedResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(result, 'Unable to update your profile.')
        );
      }

      setProfile(result.data);
      setName(result.data.name);
      setSuccessMessage('Profile updated successfully.');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update your profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || isUploadingImage) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please choose a JPEG, PNG, or WebP image.');
      setSuccessMessage('');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be 5 MB or smaller.');
      setSuccessMessage('');
      event.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/admin/profile/image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = (await response.json()) as
        | ProfileResponse
        | FailedResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(result, 'Unable to upload profile image.')
        );
      }

      setProfile(result.data);
      setSuccessMessage('Profile image updated successfully.');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to upload profile image.'
      );
    } finally {
      event.target.value = '';
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className='grid min-h-96 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Unable to load profile</p>
            <p className='mt-1'>
              {error || 'Your admin profile could not be found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-5xl'>
      <section className='border-b border-slate-200 pb-8'>
        <p className='text-sm font-semibold text-indigo-600'>Administration</p>

        <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
          My profile
        </h1>

        <p className='mt-2 text-sm leading-6 text-slate-600'>
          Update your public administrator name and profile image.
        </p>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Profile update failed</p>
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

      <section className='mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]'>
        <aside className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='relative mx-auto h-32 w-32'>
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image}
                alt={profile.name}
                className='h-32 w-32 rounded-full border-4 border-indigo-100 object-cover'
              />
            ) : (
              <div className='grid h-32 w-32 place-items-center rounded-full border-4 border-indigo-100 bg-indigo-50 text-3xl font-bold text-indigo-700'>
                {getInitials(profile.name)}
              </div>
            )}

            <label
              className={`absolute right-0 bottom-0 grid h-10 w-10 cursor-pointer place-items-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 ${
                isUploadingImage ? 'cursor-not-allowed opacity-60' : ''
              }`}
              title='Upload profile image'
            >
              {isUploadingImage ? (
                <LoaderCircle className='h-4 w-4 animate-spin' />
              ) : (
                <Camera className='h-4 w-4' />
              )}

              <input
                type='file'
                accept='image/jpeg,image/png,image/webp'
                disabled={isUploadingImage}
                onChange={uploadImage}
                className='sr-only'
              />
            </label>
          </div>

          <div className='mt-5 text-center'>
            <p className='text-lg font-bold text-slate-900'>{profile.name}</p>

            <p className='mt-1 break-all text-sm text-slate-500'>
              {profile.email}
            </p>

            <span className='mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700'>
              <ShieldCheck className='h-3.5 w-3.5' />
              {profile.role
                .toLowerCase()
                .replace(/^./, (letter) => letter.toUpperCase())}
            </span>
          </div>

          <div className='mt-6 border-t border-slate-100 pt-5'>
            <p className='text-xs font-medium text-slate-500'>
              Joined platform
            </p>

            <p className='mt-1 text-sm font-semibold text-slate-700'>
              {formatDate(profile.createdAt)}
            </p>
          </div>
        </aside>

        <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
          <div className='flex items-center gap-2'>
            <UserRound className='h-5 w-5 text-indigo-600' />

            <h2 className='text-lg font-bold text-slate-900'>
              Personal information
            </h2>
          </div>

          <div className='mt-6 grid gap-5'>
            <label>
              <span className='text-sm font-bold text-slate-800'>
                Display name
              </span>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                disabled={isSaving}
                className='mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
              />
            </label>

            <label>
              <span className='flex items-center gap-2 text-sm font-bold text-slate-800'>
                <Mail className='h-4 w-4 text-slate-500' />
                Email address
              </span>

              <input
                value={profile.email}
                readOnly
                className='mt-2 h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500'
              />

              <p className='mt-2 text-xs leading-5 text-slate-500'>
                Email changes are managed through the account authentication
                flow.
              </p>
            </label>
          </div>

          <div className='mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-xs leading-5 text-slate-500'>
              Profile image: JPEG, PNG, or WebP, maximum 5 MB.
            </p>

            <button
              type='button'
              onClick={() => void saveProfile()}
              disabled={isSaving || name.trim() === profile.name}
              className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSaving ? (
                <LoaderCircle className='h-4 w-4 animate-spin' />
              ) : (
                <Save className='h-4 w-4' />
              )}

              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </section>
      </section>
    </div>
  );
}
