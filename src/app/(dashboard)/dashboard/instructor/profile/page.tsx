// src/app/(dashboard)/dashboard/instructor/profile/page.tsx
'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Globe2,
  ImageIcon,
  LoaderCircle,
  Mail,
  Plus,
  Save,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

import {
  getInstructorProfile,
  updateInstructorProfile,
  uploadInstructorProfileImage,
  type InstructorProfileResponse,
  type UpdateInstructorProfilePayload,
} from '@/lib/instructor-profile-api';

type ProfileForm = {
  headline: string;
  bio: string;
  expertise: string[];
  website: string;
  linkedinUrl: string;
  githubUrl: string;
};

const emptyForm: ProfileForm = {
  headline: '',
  bio: '',
  expertise: [],
  website: '',
  linkedinUrl: '',
  githubUrl: '',
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return initials || 'I';
};

const profileToForm = (
  profile: InstructorProfileResponse['profile']
): ProfileForm => {
  return {
    headline: profile.headline ?? '',
    bio: profile.bio ?? '',
    expertise: profile.expertise ?? [],
    website: profile.website ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
    githubUrl: profile.githubUrl ?? '',
  };
};

export default function InstructorProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<InstructorProfileResponse | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const bioLength = form.bio.length;
  const expertiseLimitReached = form.expertise.length >= 12;

  const profileImage = localImagePreview ?? data?.user.image ?? null;

  const hasChanges = useMemo(() => {
    if (!data) {
      return false;
    }

    return JSON.stringify(form) !== JSON.stringify(profileToForm(data.profile));
  }, [data, form]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const result = await getInstructorProfile();

        if (!isMounted) {
          return;
        }

        setData(result);
        setForm(profileToForm(result.profile));
        setError('');
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load your profile.'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (localImagePreview) {
        URL.revokeObjectURL(localImagePreview);
      }
    };
  }, [localImagePreview]);

  const updateField = <Key extends keyof ProfileForm>(
    field: Key,
    value: ProfileForm[Key]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccessMessage('');
  };

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!allowedImageTypes.has(file.type)) {
      setError('Please choose a JPEG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Your profile image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    if (localImagePreview) {
      URL.revokeObjectURL(localImagePreview);
    }

    setSelectedImage(file);
    setLocalImagePreview(URL.createObjectURL(file));
    setError('');
    setSuccessMessage('');
  };

  const handleUploadImage = async () => {
    if (!selectedImage || !data) {
      return;
    }

    setIsUploadingImage(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await uploadInstructorProfileImage(selectedImage);

      setData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          user: {
            ...current.user,
            image: result.image,
          },
        };
      });

      if (localImagePreview) {
        URL.revokeObjectURL(localImagePreview);
      }

      setSelectedImage(null);
      setLocalImagePreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSuccessMessage('Profile image updated successfully.');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to upload your profile image.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const cancelSelectedImage = () => {
    if (localImagePreview) {
      URL.revokeObjectURL(localImagePreview);
    }

    setSelectedImage(null);
    setLocalImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addExpertise = () => {
    const item = expertiseInput.trim();

    if (!item) {
      return;
    }

    if (item.length > 40) {
      setError('An expertise item must be 40 characters or less.');
      return;
    }

    if (
      form.expertise.some((value) => value.toLowerCase() === item.toLowerCase())
    ) {
      setExpertiseInput('');
      return;
    }

    if (expertiseLimitReached) {
      setError('You can add up to 12 expertise items.');
      return;
    }

    setForm((current) => ({
      ...current,
      expertise: [...current.expertise, item],
    }));

    setExpertiseInput('');
    setError('');
    setSuccessMessage('');
  };

  const removeExpertise = (itemToRemove: string) => {
    setForm((current) => ({
      ...current,
      expertise: current.expertise.filter((item) => item !== itemToRemove),
    }));

    setSuccessMessage('');
  };

  const handleExpertiseKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addExpertise();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload: UpdateInstructorProfilePayload = {
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        expertise: form.expertise,
        website: form.website.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        githubUrl: form.githubUrl.trim(),
      };

      const result = await updateInstructorProfile(payload);

      setData(result);
      setForm(profileToForm(result.profile));
      setSuccessMessage('Your instructor profile has been saved.');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to save your profile.'
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
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Unable to load your profile</p>
            <p className='mt-1'>{error || 'Please refresh and try again.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl'>
      <section className='border-b border-slate-200 pb-8'>
        <p className='text-sm font-semibold text-indigo-600'>
          Instructor dashboard
        </p>

        <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
          Instructor profile
        </h1>

        <p className='mt-2 text-sm leading-6 text-slate-600'>
          Manage the public information students see about you.
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

      <section className='mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
          <div className='relative h-24 w-24 shrink-0'>
            {profileImage ? (
              <Image
                src={profileImage}
                alt={data.user.name}
                fill
                sizes='96px'
                unoptimized={Boolean(localImagePreview)}
                className='rounded-full object-cover'
              />
            ) : (
              <div className='grid h-full w-full place-items-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700'>
                {getInitials(data.user.name)}
              </div>
            )}

            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              aria-label='Choose a profile image'
              className='absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
            >
              <Camera className='h-4 w-4' />
            </button>
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
              <div>
                <h2 className='truncate text-lg font-bold text-slate-900'>
                  {data.user.name}
                </h2>

                <p className='mt-0.5 truncate text-sm text-slate-500'>
                  {data.user.email}
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
                className='inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
              >
                <ImageIcon className='h-4 w-4' />
                Choose image
              </button>
            </div>

            {selectedImage ? (
              <div className='mt-4 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold text-indigo-900'>
                    {selectedImage.name}
                  </p>

                  <p className='mt-0.5 text-xs text-indigo-700'>
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB · Ready
                    to upload
                  </p>
                </div>

                <div className='flex shrink-0 items-center gap-2'>
                  <button
                    type='button'
                    onClick={cancelSelectedImage}
                    disabled={isUploadingImage}
                    className='inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    Cancel
                  </button>

                  <button
                    type='button'
                    onClick={handleUploadImage}
                    disabled={isUploadingImage}
                    className='inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
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
            ) : (
              <p className='mt-3 text-xs leading-5 text-slate-500'>
                JPEG, PNG, or WebP. Maximum file size: 5 MB.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className='mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]'>
        <form
          onSubmit={handleSubmit}
          className='rounded-2xl border border-slate-200 bg-white shadow-sm'
        >
          <div className='border-b border-slate-100 p-5 sm:p-6'>
            <h2 className='text-lg font-bold text-slate-900'>
              Professional information
            </h2>

            <p className='mt-1 text-sm text-slate-500'>
              Add your teaching expertise and professional links.
            </p>
          </div>

          <div className='space-y-6 p-5 sm:p-6'>
            <label className='block'>
              <span className='text-sm font-semibold text-slate-700'>
                Professional headline
              </span>

              <input
                value={form.headline}
                onChange={(event) =>
                  updateField('headline', event.target.value)
                }
                maxLength={120}
                placeholder='e.g. Frontend Developer and React Instructor'
                className='mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />

              <span className='mt-1.5 block text-xs text-slate-500'>
                {form.headline.length}/120 characters
              </span>
            </label>

            <label className='block'>
              <span className='text-sm font-semibold text-slate-700'>
                About you
              </span>

              <textarea
                value={form.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                maxLength={2000}
                rows={7}
                placeholder='Tell students about your background, teaching style, and the topics you teach...'
                className='mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />

              <span className='mt-1.5 block text-xs text-slate-500'>
                {bioLength}/2000 characters
              </span>
            </label>

            <div>
              <div className='flex items-center justify-between gap-4'>
                <label
                  htmlFor='expertise'
                  className='text-sm font-semibold text-slate-700'
                >
                  Areas of expertise
                </label>

                <span className='text-xs text-slate-500'>
                  {form.expertise.length}/12
                </span>
              </div>

              <div className='mt-2 flex gap-2'>
                <input
                  id='expertise'
                  value={expertiseInput}
                  onChange={(event) => setExpertiseInput(event.target.value)}
                  onKeyDown={handleExpertiseKeyDown}
                  disabled={expertiseLimitReached}
                  maxLength={40}
                  placeholder='e.g. React'
                  className='h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
                />

                <button
                  type='button'
                  onClick={addExpertise}
                  disabled={expertiseLimitReached || !expertiseInput.trim()}
                  className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Plus className='h-4 w-4' />
                  Add
                </button>
              </div>

              <p className='mt-2 text-xs text-slate-500'>
                Press Enter or comma to add an item.
              </p>

              {form.expertise.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {form.expertise.map((item) => (
                    <span
                      key={item}
                      className='inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700'
                    >
                      {item}

                      <button
                        type='button'
                        onClick={() => removeExpertise(item)}
                        aria-label={`Remove ${item}`}
                        className='rounded-full text-indigo-500 transition hover:text-rose-600'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className='border-t border-slate-100 pt-6'>
              <h3 className='text-sm font-bold text-slate-900'>
                Professional links
              </h3>

              <p className='mt-1 text-sm text-slate-500'>
                These links may be shown on your public instructor profile.
              </p>

              <div className='mt-5 grid gap-5'>
                <label className='block'>
                  <span className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
                    <Globe2 className='h-4 w-4 text-slate-500' />
                    Website
                  </span>

                  <input
                    type='url'
                    value={form.website}
                    onChange={(event) =>
                      updateField('website', event.target.value)
                    }
                    placeholder='https://yourwebsite.com'
                    className='mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />
                </label>

                <label className='block'>
                  <span className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
                    <FaLinkedin className='h-4 w-4 text-slate-500' />
                    LinkedIn
                  </span>

                  <input
                    type='url'
                    value={form.linkedinUrl}
                    onChange={(event) =>
                      updateField('linkedinUrl', event.target.value)
                    }
                    placeholder='https://linkedin.com/in/username'
                    className='mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />
                </label>

                <label className='block'>
                  <span className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
                    <FaGithub className='h-4 w-4 text-slate-500' />
                    GitHub
                  </span>

                  <input
                    type='url'
                    value={form.githubUrl}
                    onChange={(event) =>
                      updateField('githubUrl', event.target.value)
                    }
                    placeholder='https://github.com/username'
                    className='mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />
                </label>
              </div>
            </div>
          </div>

          <div className='flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
            <p className='text-xs text-slate-500'>
              Changes are visible after you save them.
            </p>

            <button
              type='submit'
              disabled={isSaving || !hasChanges}
              className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isSaving ? (
                <LoaderCircle className='h-4 w-4 animate-spin' />
              ) : (
                <Save className='h-4 w-4' />
              )}

              {isSaving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>

        <aside className='h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <p className='text-xs font-bold tracking-wide text-indigo-600 uppercase'>
            Profile preview
          </p>

          <div className='mt-5 flex items-center gap-3'>
            {profileImage ? (
              <Image
                src={profileImage}
                alt={data.user.name}
                width={56}
                height={56}
                unoptimized={Boolean(localImagePreview)}
                className='h-14 w-14 rounded-full object-cover'
              />
            ) : (
              <div className='grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700'>
                {getInitials(data.user.name)}
              </div>
            )}

            <div className='min-w-0'>
              <h2 className='truncate font-bold text-slate-900'>
                {data.user.name}
              </h2>

              <p className='mt-0.5 truncate text-sm text-slate-500'>
                {form.headline || 'Instructor at SkillSphere'}
              </p>
            </div>
          </div>

          <div className='mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm'>
            <p className='flex items-center gap-2 text-slate-600'>
              <Mail className='h-4 w-4 text-slate-400' />
              <span className='truncate'>{data.user.email}</span>
            </p>

            <p className='flex items-center gap-2 text-slate-600'>
              <UserRound className='h-4 w-4 text-slate-400' />
              Instructor account
            </p>

            <p className='flex items-center gap-2 text-slate-600'>
              <ImageIcon className='h-4 w-4 text-slate-400' />
              Image hosted securely on ImgBB
            </p>
          </div>

          {form.expertise.length > 0 && (
            <div className='mt-5 border-t border-slate-100 pt-5'>
              <p className='text-xs font-bold tracking-wide text-slate-500 uppercase'>
                Expertise
              </p>

              <div className='mt-3 flex flex-wrap gap-2'>
                {form.expertise.map((item) => (
                  <span
                    key={item}
                    className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
