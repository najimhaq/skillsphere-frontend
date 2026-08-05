'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  CirclePlus,
  Clock3,
  Eye,
  FileWarning,
  LoaderCircle,
  MoreVertical,
  RefreshCw,
  Send,
  Trash2,
} from 'lucide-react';

import {
  deleteInstructorCourse,
  getMyInstructorCourses,
  submitCourseForReview,
  type InstructorCourse,
} from '@/lib/instructor-course-api';

const statusStyle = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  ARCHIVED: 'bg-zinc-200 text-zinc-700',
} as const;

const statusLabel = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending review',
  PUBLISHED: 'Published',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
} as const;

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      try {
        const data = await getMyInstructorCourses();

        if (!isMounted) {
          return;
        }

        setCourses(data);
        setError('');
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setCourses([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load your courses.'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    void loadCourses();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const refreshCourses = () => {
    setIsRefreshing(true);
    setReloadKey((currentValue) => currentValue + 1);
  };

  const handleSubmitForReview = async (courseId: string) => {
    try {
      setActionId(courseId);
      setError('');

      await submitCourseForReview(courseId);

      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course._id === courseId
            ? {
                ...course,
                status: 'PENDING_REVIEW',
                reviewNote: null,
                reviewedAt: null,
              }
            : course
        )
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to submit the course for review.'
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (course: InstructorCourse) => {
    const confirmed = window.confirm(
      `Delete "${course.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(course._id);
      setError('');

      await deleteInstructorCourse(course._id);

      setCourses((currentCourses) =>
        currentCourses.filter((item) => item._id !== course._id)
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to delete the course.'
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-indigo-600'>
            Instructor workspace
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            My courses
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Create, improve, and submit your courses for admin review.
          </p>
        </div>

        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={refreshCourses}
            disabled={isRefreshing}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link
            href='/dashboard/instructor/courses/create'
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
          >
            <CirclePlus className='h-4 w-4' />
            Create a course
          </Link>
        </div>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className='grid min-h-80 place-items-center'>
          <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
            <LoaderCircle className='h-5 w-5 animate-spin' />
            Loading your courses...
          </div>
        </div>
      ) : courses.length === 0 ? (
        <section className='mt-8 grid min-h-96 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center'>
          <div>
            <div className='mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-indigo-600'>
              <BookOpen className='h-7 w-7' />
            </div>

            <h2 className='mt-5 text-lg font-bold text-slate-900'>
              You have not created a course yet
            </h2>

            <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500'>
              Start creating your first course. It will remain a draft until you
              submit it for review.
            </p>

            <Link
              href='/dashboard/instructor/courses/create'
              className='mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700'
            >
              <CirclePlus className='h-4 w-4' />
              Create your first course
            </Link>
          </div>
        </section>
      ) : (
        <section className='mt-8 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {courses.map((course) => {
            const isBusy = actionId === course._id;

            const canEdit =
              course.status === 'DRAFT' || course.status === 'REJECTED';

            const canSubmit =
              course.status === 'DRAFT' || course.status === 'REJECTED';

            const canDelete =
              course.status === 'DRAFT' || course.status === 'REJECTED';

            const isPending = course.status === 'PENDING_REVIEW';

            return (
              <article
                key={course._id}
                className='flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
              >
                <div className='relative h-48 w-full shrink-0 overflow-hidden bg-linear-to-br from-indigo-100 via-violet-100 to-sky-100'>
                  {course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className='block h-full w-full object-cover object-center'
                    />
                  ) : (
                    <div className='grid h-full w-full place-items-center'>
                      <BookOpen className='h-10 w-10 text-indigo-500' />
                    </div>
                  )}

                  <span
                    className={`absolute top-3 right-3 z-10 rounded-full px-2.5 py-1 text-xs font-bold ${
                      statusStyle[course.status]
                    }`}
                  >
                    {statusLabel[course.status]}
                  </span>
                </div>

                <div className='flex flex-1 flex-col p-5'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-indigo-600'>
                        {course.category}
                      </p>

                      <h2 className='mt-1 truncate text-lg font-bold text-slate-900'>
                        {course.title}
                      </h2>
                    </div>

                    <MoreVertical className='h-5 w-5 shrink-0 text-slate-400' />
                  </div>

                  <p className='mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600'>
                    {course.shortDescription}
                  </p>

                  <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm'>
                    <span className='font-medium text-slate-600'>
                      {course.level.charAt(0) +
                        course.level.slice(1).toLowerCase()}
                    </span>

                    <span className='font-semibold text-slate-900'>
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                  </div>

                  {course.reviewNote && (
                    <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3'>
                      <p className='flex items-center gap-2 text-xs font-bold text-amber-900'>
                        <FileWarning className='h-4 w-4 text-amber-700' />
                        Admin review feedback
                      </p>

                      <p className='mt-2 text-sm leading-6 text-amber-800'>
                        {course.reviewNote}
                      </p>

                      {course.reviewedAt && (
                        <p className='mt-2 text-xs font-medium text-amber-700'>
                          Reviewed on {formatDate(course.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {isPending && (
                    <div className='mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800'>
                      <Clock3 className='mt-0.5 h-4 w-4 shrink-0' />

                      <p>
                        Your course has been submitted and is waiting for admin
                        review.
                      </p>
                    </div>
                  )}

                  {course.status === 'PUBLISHED' && (
                    <div className='mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800'>
                      <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' />

                      <p>
                        Your course is live and visible in the public catalog.
                      </p>
                    </div>
                  )}

                  {course.status === 'ARCHIVED' && (
                    <div className='mt-4 flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700'>
                      <Clock3 className='mt-0.5 h-4 w-4 shrink-0' />

                      <p>
                        This course has been archived and cannot be updated.
                      </p>
                    </div>
                  )}

                  <div className='mt-auto flex flex-wrap gap-2 pt-5'>
                    {course.status === 'PUBLISHED' ? (
                      <Link
                        href={`/courses/${course.slug}`}
                        target='_blank'
                        className='inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                      >
                        <Eye className='h-4 w-4 shrink-0' />
                        View live course
                      </Link>
                    ) : canEdit ? (
                      <Link
                        href={`/dashboard/instructor/courses/${course._id}/edit`}
                        className='inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                      >
                        <Clock3 className='h-4 w-4 shrink-0' />
                        {course.status === 'REJECTED'
                          ? 'Improve course'
                          : 'Edit draft'}
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/instructor/courses/${course._id}/edit`}
                        className='inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                      >
                        <Eye className='h-4 w-4 shrink-0' />
                        View details
                      </Link>
                    )}

                    {canEdit && (
                      <Link
                        href={`/dashboard/instructor/courses/${course._id}/content`}
                        className='inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100'
                        title='Manage course content'
                      >
                        <BookOpen className='h-4 w-4 shrink-0' />
                      </Link>
                    )}

                    {canSubmit && (
                      <button
                        type='button'
                        disabled={isBusy}
                        onClick={() => void handleSubmitForReview(course._id)}
                        className='inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
                        title='Submit for review'
                      >
                        {isBusy ? (
                          <LoaderCircle className='h-4 w-4 animate-spin' />
                        ) : (
                          <Send className='h-4 w-4' />
                        )}
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type='button'
                        disabled={isBusy}
                        onClick={() => void handleDelete(course)}
                        className='inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60'
                        title='Delete course'
                      >
                        {isBusy ? (
                          <LoaderCircle className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash2 className='h-4 w-4' />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
