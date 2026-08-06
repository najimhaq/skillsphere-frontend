'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  BookOpen,
  Camera,
  CheckCircle2,
  Edit3,
  GraduationCap,
  LoaderCircle,
  Mail,
  Save,
  Settings,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { authClient } from '@/lib/auth-client';
import {
  getStudentDashboardOverview,
  uploadStudentProfileImage,
  type StudentDashboardOverview,
} from '@/lib/student-dashboard-api';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);



const getInitials = (name: string) => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U'
  );
};

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: session,
    isPending,
    refetch: refetchSession,
  } = authClient.useSession();

  const [overview, setOverview] = useState<StudentDashboardOverview | null>(
    null
  );
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(
    null
  );

  const user = session?.user;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace('/sign-in');
    }
  }, [isPending, router, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isCancelled = false;

    const loadOverview = async () => {
      try {
        const data = await getStudentDashboardOverview();

        if (!isCancelled) {
          setOverview(data);
        }
      } catch {
        if (!isCancelled) {
          setOverview(null);
        }
      } finally {
        if (!isCancelled) {
          setIsOverviewLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  useEffect(() => {
    return () => {
      if (localImagePreview) {
        URL.revokeObjectURL(localImagePreview);
      }
    };
  }, [localImagePreview]);

  const displayName = user?.name ?? 'Student';
  const avatarUrl = localImagePreview ?? user?.image ?? '';
  const stats = overview?.stats;

  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(user.createdAt))
    : '—';

  const clearSelectedImage = () => {
    if (localImagePreview) {
      URL.revokeObjectURL(localImagePreview);
    }

    setSelectedImage(null);
    setLocalImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetEditForm = () => {
    setName(user?.name ?? '');
    clearSelectedImage();
    setIsEditing(false);
  };

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!allowedImageTypes.has(file.type)) {
      toast.error('Please choose a JPEG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Your profile image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    if (localImagePreview) {
      URL.revokeObjectURL(localImagePreview);
    }

    setSelectedImage(file);
    setLocalImagePreview(URL.createObjectURL(file));
  };

  const uploadSelectedImage = async (): Promise<void> => {
    

    if (!selectedImage) {
      toast.error('Please choose an image first.');
      return;
    }

    setIsUploadingImage(true);

    try {
      const result = await uploadStudentProfileImage(selectedImage);

      await refetchSession();

      clearSelectedImage();

      toast.success(
        result.image
          ? 'Profile image updated successfully.'
          : 'Profile image uploaded successfully.'
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to upload profile image.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      toast.error('Name must contain at least 2 characters.');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await authClient.updateUser({
        name: normalizedName,
      });

      if (error) {
        toast.error(error.message ?? 'Unable to update your profile.');
        return;
      }

      await refetchSession();
      setIsEditing(false);

      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to update your profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className='grid min-h-80 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='mx-auto max-w-5xl'>
      <section className='overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm'>
        <div className='h-36 bg-linear-to-r from-indigo-700 via-indigo-600 to-violet-600 sm:h-44' />

        <div className='relative px-6 pb-7 sm:px-8'>
          <div className='-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
              <div className='grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-md sm:h-32 sm:w-32'>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={`${displayName}'s profile`}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  getInitials(displayName)
                )}
              </div>

              <div className='pb-1'>
                <p className='text-sm font-semibold text-indigo-600'>
                  Student profile
                </p>

                <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
                  {displayName}
                </h1>

                <div className='mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500'>
                  <span className='inline-flex items-center gap-1.5'>
                    <Mail className='h-4 w-4' />
                    {user.email}
                  </span>

                  <span className='hidden text-slate-300 sm:inline'>•</span>

                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-3 sm:pb-1'>
              <Link
                href='/dashboard/student/settings'
                className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
              >
                <Settings className='h-4 w-4' />
                Settings
              </Link>

              <button
                type='button'
                onClick={() => {
                  setName(user.name ?? '');
                  setIsEditing((value) => !value);
                }}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700'
              >
                <Edit3 className='h-4 w-4' />
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {isEditing && (
        <section className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='flex items-start gap-3 border-b border-slate-100 px-6 py-5'>
            <div className='grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-600'>
              <Edit3 className='h-5 w-5' />
            </div>

            <div>
              <h2 className='text-lg font-bold text-slate-900'>Edit profile</h2>

              <p className='mt-1 text-sm text-slate-500'>
                Update your display name and upload a profile image.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className='p-6'>
            <div className='grid max-w-2xl gap-5'>
              <label className='block'>
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
                  className='mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                />
              </label>

              <div>
                <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
                  <div>
                    <p className='text-sm font-semibold text-slate-700'>
                      Profile image
                    </p>

                    <p className='mt-1 text-xs leading-5 text-slate-500'>
                      JPEG, PNG, or WebP. Maximum file size: 5 MB.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/jpeg,image/png,image/webp'
                    onChange={handleSelectImage}
                    className='hidden'
                  />

                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    <Camera className='h-4 w-4' />
                    Choose image
                  </button>
                </div>

                {selectedImage && (
                  <div className='mt-4 flex flex-col gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-indigo-100'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={localImagePreview ?? ''}
                          alt='Selected profile image preview'
                          className='h-full w-full object-cover'
                        />
                      </div>

                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-indigo-900'>
                          {selectedImage.name}
                        </p>

                        <p className='mt-1 text-xs text-indigo-700'>
                          {(selectedImage.size / 1024 / 1024).toFixed(2)} MB ·
                          Ready to upload
                        </p>
                      </div>
                    </div>

                    <div className='flex shrink-0 items-center gap-2'>
                      <button
                        type='button'
                        onClick={clearSelectedImage}
                        disabled={isUploadingImage}
                        className='inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60'
                      >
                        Cancel
                      </button>

                      <button
                        type='button'
                        onClick={() => void uploadSelectedImage()}
                        disabled={isUploadingImage}
                        className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
                      >
                        {isUploadingImage ? (
                          <LoaderCircle className='h-4 w-4 animate-spin' />
                        ) : (
                          <Upload className='h-4 w-4' />
                        )}

                        {isUploadingImage ? 'Uploading...' : 'Upload image'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='mt-6 flex flex-wrap gap-3'>
              <button
                type='submit'
                disabled={isSaving || isUploadingImage}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className='h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4' />
                    Save name
                  </>
                )}
              </button>

              <button
                type='button'
                onClick={resetEditForm}
                disabled={isSaving || isUploadingImage}
                className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
              >
                <X className='h-4 w-4' />
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className='mt-6 grid gap-4 sm:grid-cols-3'>
        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600'>
            <GraduationCap className='h-5 w-5' />
          </div>

          <p className='mt-4 text-3xl font-bold text-slate-900'>
            {isOverviewLoading ? '—' : (stats?.coursesEnrolled ?? 0)}
          </p>

          <p className='mt-1 text-sm font-medium text-slate-500'>
            Courses enrolled
          </p>
        </article>

        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600'>
            <BookOpen className='h-5 w-5' />
          </div>

          <p className='mt-4 text-3xl font-bold text-slate-900'>
            {isOverviewLoading ? '—' : (stats?.lessonsCompleted ?? 0)}
          </p>

          <p className='mt-1 text-sm font-medium text-slate-500'>
            Lessons completed
          </p>
        </article>

        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600'>
            <Award className='h-5 w-5' />
          </div>

          <p className='mt-4 text-3xl font-bold text-slate-900'>
            {isOverviewLoading ? '—' : (stats?.certificatesEarned ?? 0)}
          </p>

          <p className='mt-1 text-sm font-medium text-slate-500'>
            Certificates earned
          </p>
        </article>
      </section>

      <section className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-start gap-3 border-b border-slate-100 px-6 py-5'>
          <div className='grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-600'>
            <ShieldCheck className='h-5 w-5' />
          </div>

          <div>
            <h2 className='text-lg font-bold text-slate-900'>Account status</h2>

            <p className='mt-1 text-sm text-slate-500'>
              Your SkillSphere account information.
            </p>
          </div>
        </div>

        <dl className='divide-y divide-slate-100'>
          <div className='flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
            <dt className='text-sm font-medium text-slate-500'>Role</dt>

            <dd className='inline-flex w-fit rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700'>
              {user.role ?? 'STUDENT'}
            </dd>
          </div>

          <div className='flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
            <dt className='text-sm font-medium text-slate-500'>
              Email verification
            </dt>

            <dd
              className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                user.emailVerified
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <CheckCircle2 className='h-3.5 w-3.5' />
              {user.emailVerified ? 'Verified' : 'Not verified'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
