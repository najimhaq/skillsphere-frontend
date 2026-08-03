// src/app/(dashboard)/dashboard/instructor/courses/create/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon, LoaderCircle, Save } from 'lucide-react';

import {
  createInstructorCourse,
  type CourseLevel,
} from '@/lib/instructor-course-api';

type FormState = {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: string;
  thumbnailUrl: string;
};

const initialForm: FormState = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  level: 'BEGINNER',
  price: '0',
  thumbnailUrl: '',
};

export default function CreateCoursePage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));

    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await createInstructorCourse({
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        level: form.level,
        price: Number(form.price),
        thumbnailUrl: form.thumbnailUrl.trim() || undefined,
      });

      router.push('/dashboard/instructor/courses');
      router.refresh();
    } catch (caughtError) {
      const typedError = caughtError as Error & {
        fieldErrors?: Record<string, string[] | undefined>;
      };

      setError(typedError.message);
      setFieldErrors(typedError.fieldErrors ?? {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) => fieldErrors[field]?.[0];

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='mb-8'>
        <Link
          href='/dashboard/instructor/courses'
          className='inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to my courses
        </Link>

        <h1 className='mt-5 text-3xl font-bold tracking-tight text-slate-900'>
          Create a new course
        </h1>

        <p className='mt-2 text-sm leading-6 text-slate-600'>
          Add the course information below. Your course will be saved as a
          draft, then you can submit it for admin review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {error && (
          <div className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
            {error}
          </div>
        )}

        <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='mb-6'>
            <h2 className='text-lg font-bold text-slate-900'>
              Basic information
            </h2>
            <p className='mt-1 text-sm text-slate-500'>
              Use a clear title and concise summary for learners.
            </p>
          </div>

          <div className='space-y-5'>
            <div>
              <label
                htmlFor='title'
                className='text-sm font-semibold text-slate-700'
              >
                Course title
              </label>

              <input
                id='title'
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder='e.g. Next.js Full-Stack Development'
                className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />

              <p className='mt-1.5 text-xs text-slate-500'>
                5 to 120 characters
              </p>

              {getFieldError('title') && (
                <p className='mt-1 text-xs text-rose-600'>
                  {getFieldError('title')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='shortDescription'
                className='text-sm font-semibold text-slate-700'
              >
                Short description
              </label>

              <textarea
                id='shortDescription'
                value={form.shortDescription}
                onChange={(event) =>
                  updateField('shortDescription', event.target.value)
                }
                rows={3}
                placeholder='Briefly describe what learners will gain from this course.'
                className='mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />

              <p className='mt-1.5 text-xs text-slate-500'>
                20 to 300 characters
              </p>

              {getFieldError('shortDescription') && (
                <p className='mt-1 text-xs text-rose-600'>
                  {getFieldError('shortDescription')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='description'
                className='text-sm font-semibold text-slate-700'
              >
                Full description
              </label>

              <textarea
                id='description'
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                rows={8}
                placeholder='Explain the course content, skills learners will gain, and who this course is for.'
                className='mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />

              <p className='mt-1.5 text-xs text-slate-500'>
                Minimum 50 characters
              </p>

              {getFieldError('description') && (
                <p className='mt-1 text-xs text-rose-600'>
                  {getFieldError('description')}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='mb-6'>
            <h2 className='text-lg font-bold text-slate-900'>
              Course settings
            </h2>
            <p className='mt-1 text-sm text-slate-500'>
              Choose a category, level, price, and optional course cover.
            </p>
          </div>

          <div className='grid gap-5 sm:grid-cols-2'>
            <div>
              <label
                htmlFor='category'
                className='text-sm font-semibold text-slate-700'
              >
                Category
              </label>

              <select
                id='category'
                value={form.category}
                onChange={(event) =>
                  updateField('category', event.target.value)
                }
                className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              >
                <option value='' disabled>
                  Select a category
                </option>
                <option value='Web Development'>Web Development</option>
                <option value='App Development'>App Development</option>
                <option value='Programming'>Programming</option>
                <option value='Design'>Design</option>
                <option value='Tools'>Tools</option>
                <option value='Business'>Business</option>
              </select>

              {getFieldError('category') && (
                <p className='mt-1 text-xs text-rose-600'>
                  {getFieldError('category')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='level'
                className='text-sm font-semibold text-slate-700'
              >
                Difficulty level
              </label>

              <select
                id='level'
                value={form.level}
                onChange={(event) =>
                  updateField('level', event.target.value as CourseLevel)
                }
                className='mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              >
                <option value='BEGINNER'>Beginner</option>
                <option value='INTERMEDIATE'>Intermediate</option>
                <option value='ADVANCED'>Advanced</option>
              </select>

              {getFieldError('level') && (
                <p className='mt-1 text-xs text-rose-600'>
                  {getFieldError('level')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='price'
                className='text-sm font-semibold text-slate-700'
              >
                Price (USD)
              </label>

              <input
                id='price'
                type='number'
                min='0'
                step='0.01'
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />

              <p className='mt-1.5 text-xs text-slate-500'>
                Set 0 for a free course
              </p>

              {getFieldError('price') && (
                <p className='mt-1 text-xs text-rose-600'>
                  {getFieldError('price')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='thumbnailUrl'
                className='text-sm font-semibold text-slate-700'
              >
                Thumbnail URL <span className='font-normal'>(optional)</span>
              </label>

              <div className='relative mt-2'>
                <ImageIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />

                <input
                  id='thumbnailUrl'
                  type='url'
                  value={form.thumbnailUrl}
                  onChange={(event) =>
                    updateField('thumbnailUrl', event.target.value)
                  }
                  placeholder='https://example.com/course-cover.jpg'
                  className='w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                />
              </div>

              {getFieldError('thumbnailUrl') && (
                <p className='mt-1 text-xs text-rose-600'>
                  {getFieldError('thumbnailUrl')}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className='flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end'>
          <Link
            href='/dashboard/instructor/courses'
            className='inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
          >
            Cancel
          </Link>

          <button
            type='submit'
            disabled={isSubmitting}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Saving draft...
              </>
            ) : (
              <>
                <Save className='h-4 w-4' />
                Save as draft
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
