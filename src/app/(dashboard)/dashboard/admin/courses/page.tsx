'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleX,
  ClipboardCheck,
  Eye,
  FileWarning,
  LoaderCircle,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type CourseStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

type ReviewAction = 'PUBLISH' | 'REJECT' | 'REQUEST_CHANGES';

type Instructor = {
  _id: string;
  name: string;
  email: string;
  image: string | null;
};

type AdminCourse = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  price: number;
  status: CourseStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  instructor: Instructor | null;
};

type CoursesResponse = {
  success: true;
  data: AdminCourse[];
};

type ReviewModalState = {
  course: AdminCourse;
  action: ReviewAction;
};

type FailedResponse = {
  success: false;
  message?: string;
};

const statusOptions: Array<{
  value: CourseStatus;
  label: string;
}> = [
  { value: 'PENDING_REVIEW', label: 'Pending review' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const actionConfig: Record<
  ReviewAction,
  {
    title: string;
    description: string;
    confirmLabel: string;
    buttonClassName: string;
    iconClassName: string;
    requiresNote: boolean;
  }
> = {
  PUBLISH: {
    title: 'Publish course',
    description:
      'This course will become visible in the public course catalog and available for student enrollment.',
    confirmLabel: 'Publish course',
    buttonClassName: 'bg-emerald-600 hover:bg-emerald-700',
    iconClassName: 'bg-emerald-100 text-emerald-700',
    requiresNote: false,
  },

  REJECT: {
    title: 'Reject course',
    description:
      'The instructor will receive your feedback and can use it to improve the course before submitting again.',
    confirmLabel: 'Reject course',
    buttonClassName: 'bg-rose-600 hover:bg-rose-700',
    iconClassName: 'bg-rose-100 text-rose-700',
    requiresNote: true,
  },

  REQUEST_CHANGES: {
    title: 'Request changes',
    description:
      'The course will return to draft status so the instructor can update it and submit it again.',
    confirmLabel: 'Request changes',
    buttonClassName: 'bg-amber-600 hover:bg-amber-700',
    iconClassName: 'bg-amber-100 text-amber-700',
    requiresNote: true,
  },
};

const getStatusStyle = (status: CourseStatus) => {
  const styles: Record<
    CourseStatus,
    {
      label: string;
      className: string;
    }
  > = {
    DRAFT: {
      label: 'Draft',
      className: 'bg-slate-100 text-slate-700',
    },
    PENDING_REVIEW: {
      label: 'Pending review',
      className: 'bg-amber-100 text-amber-800',
    },
    PUBLISHED: {
      label: 'Published',
      className: 'bg-emerald-100 text-emerald-700',
    },
    REJECTED: {
      label: 'Rejected',
      className: 'bg-rose-100 text-rose-700',
    },
    ARCHIVED: {
      label: 'Archived',
      className: 'bg-zinc-200 text-zinc-700',
    },
  };

  return styles[status];
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

const getInitials = (name: string) => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase() || 'I'
  );
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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<CourseStatus>('PENDING_REVIEW');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [reviewModal, setReviewModal] = useState<ReviewModalState | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const selectedStatusLabel = useMemo(() => {
    return (
      statusOptions.find((item) => item.value === statusFilter)?.label ??
      'Courses'
    );
  }, [statusFilter]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/courses?status=${statusFilter}`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          }
        );

        const result = (await response.json()) as
          | CoursesResponse
          | FailedResponse;

        if (!response.ok || !result.success) {
          throw new Error(getErrorMessage(result, 'Unable to load courses.'));
        }

        setCourses(result.data);
        setError('');
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setCourses([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load courses.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setHasLoaded(true);
        }
      }
    };

    void fetchCourses();

    return () => {
      controller.abort();
    };
  }, [statusFilter]);

  const refreshCourses = async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/courses?status=${statusFilter}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }
      );

      const result = (await response.json()) as
        | CoursesResponse
        | FailedResponse;

      if (!response.ok || !result.success) {
        throw new Error(getErrorMessage(result, 'Unable to load courses.'));
      }

      setCourses(result.data);
      setError('');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load courses.'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const openReviewModal = (course: AdminCourse, action: ReviewAction) => {
    setReviewModal({ course, action });
    setReviewNote('');
    setActionError('');
  };

  const closeReviewModal = () => {
    if (isSubmitting) {
      return;
    }

    setReviewModal(null);
    setReviewNote('');
    setActionError('');
  };

  const submitReview = async () => {
    if (!reviewModal) {
      return;
    }

    const config = actionConfig[reviewModal.action];
    const normalizedNote = reviewNote.trim();

    if (config.requiresNote && normalizedNote.length < 10) {
      setActionError(
        'Please write feedback with at least 10 characters for the instructor.'
      );
      return;
    }

    setIsSubmitting(true);
    setActionError('');

    try {
      const response = await fetch(
        `${API_URL}/api/admin/courses/${reviewModal.course._id}/review`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: reviewModal.action,
            reviewNote: normalizedNote || undefined,
          }),
        }
      );

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to review this course.');
      }

      setReviewModal(null);
      setReviewNote('');
      await refreshCourses();
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to review this course.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <Link
            href='/dashboard/admin'
            className='inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to overview
          </Link>

          <p className='mt-5 text-sm font-semibold text-indigo-600'>
            Course moderation
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Course review queue
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Review instructor submissions and keep the course catalog
            high-quality.
          </p>
        </div>

        <button
          type='button'
          onClick={() => void refreshCourses()}
          disabled={isRefreshing}
          className='inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      <section className='mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5'>
        <div className='flex items-center gap-3'>
          <div className='grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-700'>
            <ClipboardCheck className='h-5 w-5' />
          </div>

          <div>
            <p className='text-sm font-bold text-slate-900'>
              {selectedStatusLabel}
            </p>

            <p className='mt-0.5 text-sm text-slate-500'>
              {courses.length} course{courses.length === 1 ? '' : 's'} found
            </p>
          </div>
        </div>

        <div className='relative'>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CourseStatus)
            }
            className='h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-10 pl-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-52'
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className='pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-500' />
        </div>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Unable to load courses</p>
            <p className='mt-1'>{error}</p>
          </div>
        </div>
      )}

      {!hasLoaded ? (
        <div className='grid min-h-96 place-items-center'>
          <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
            <LoaderCircle className='h-5 w-5 animate-spin' />
            Loading courses...
          </div>
        </div>
      ) : courses.length === 0 ? (
        <section className='mt-6 grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center'>
          <div>
            <CheckCircle2 className='mx-auto h-12 w-12 text-emerald-500' />

            <h2 className='mt-4 text-lg font-bold text-slate-800'>
              No {selectedStatusLabel.toLowerCase()} courses
            </h2>

            <p className='mt-2 max-w-sm text-sm leading-6 text-slate-500'>
              New instructor submissions will appear here when they are ready
              for review.
            </p>
          </div>
        </section>
      ) : (
        <section className='mt-6 grid gap-5 lg:grid-cols-2'>
          {courses.map((course) => {
            const status = getStatusStyle(course.status);
            const canReview = course.status === 'PENDING_REVIEW';

            return (
              <article
                key={course._id}
                className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
              >
                <div className='flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>

                      <span className='text-xs font-medium text-slate-500'>
                        {course.category} · {course.level}
                      </span>
                    </div>

                    <h2 className='mt-3 line-clamp-2 text-lg font-bold text-slate-900'>
                      {course.title}
                    </h2>

                    <p className='mt-2 line-clamp-2 text-sm leading-6 text-slate-600'>
                      {course.shortDescription}
                    </p>
                  </div>

                  <span className='shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'>
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                </div>

                <div className='space-y-4 p-5'>
                  <div className='flex items-center gap-3'>
                    <div className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700'>
                      {course.instructor
                        ? getInitials(course.instructor.name)
                        : 'I'}
                    </div>

                    <div className='min-w-0'>
                      <p className='text-xs font-medium text-slate-500'>
                        Instructor
                      </p>

                      <p className='truncate text-sm font-bold text-slate-800'>
                        {course.instructor?.name ?? 'Unknown instructor'}
                      </p>

                      <p className='truncate text-xs text-slate-500'>
                        {course.instructor?.email ?? 'No email available'}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3'>
                    <div>
                      <p className='text-xs font-medium text-slate-500'>
                        Submitted
                      </p>

                      <p className='mt-1 text-sm font-semibold text-slate-700'>
                        {formatDate(course.updatedAt)}
                      </p>
                    </div>

                    <div>
                      <p className='text-xs font-medium text-slate-500'>
                        Created
                      </p>

                      <p className='mt-1 text-sm font-semibold text-slate-700'>
                        {formatDate(course.createdAt)}
                      </p>
                    </div>
                  </div>

                  {course.reviewNote && (
                    <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                      <p className='flex items-center gap-2 text-xs font-bold text-slate-700'>
                        <FileWarning className='h-4 w-4 text-slate-500' />
                        Previous review note
                      </p>

                      <p className='mt-2 text-sm leading-6 text-slate-600'>
                        {course.reviewNote}
                      </p>
                    </div>
                  )}

                  <div className='flex flex-wrap gap-2 border-t border-slate-100 pt-4'>
                    <Link
                      href={`/dashboard/admin/courses/${course._id}`}
                      className='inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                    >
                      <Eye className='h-4 w-4' />
                      Review details
                    </Link>

                    {canReview && (
                      <>
                        <button
                          type='button'
                          onClick={() => openReviewModal(course, 'PUBLISH')}
                          className='inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700'
                        >
                          <CheckCircle2 className='h-4 w-4' />
                          Publish
                        </button>

                        <button
                          type='button'
                          onClick={() =>
                            openReviewModal(course, 'REQUEST_CHANGES')
                          }
                          className='inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 text-sm font-semibold text-white transition hover:bg-amber-600'
                        >
                          <Send className='h-4 w-4' />
                          Request changes
                        </button>

                        <button
                          type='button'
                          onClick={() => openReviewModal(course, 'REJECT')}
                          className='inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 text-sm font-semibold text-white transition hover:bg-rose-700'
                        >
                          <CircleX className='h-4 w-4' />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {reviewModal && (
        <div
          className='fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4'
          role='presentation'
          onMouseDown={closeReviewModal}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='review-modal-title'
            className='w-full max-w-lg rounded-2xl bg-white shadow-2xl'
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className='flex items-start justify-between gap-4 border-b border-slate-100 p-5'>
              <div className='flex items-start gap-3'>
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    actionConfig[reviewModal.action].iconClassName
                  }`}
                >
                  {reviewModal.action === 'PUBLISH' ? (
                    <CheckCircle2 className='h-5 w-5' />
                  ) : reviewModal.action === 'REJECT' ? (
                    <CircleX className='h-5 w-5' />
                  ) : (
                    <Send className='h-5 w-5' />
                  )}
                </div>

                <div>
                  <h2
                    id='review-modal-title'
                    className='text-lg font-bold text-slate-900'
                  >
                    {actionConfig[reviewModal.action].title}
                  </h2>

                  <p className='mt-1 text-sm text-slate-500'>
                    {reviewModal.course.title}
                  </p>
                </div>
              </div>

              <button
                type='button'
                onClick={closeReviewModal}
                disabled={isSubmitting}
                aria-label='Close review dialog'
                className='grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='p-5'>
              <p className='text-sm leading-6 text-slate-600'>
                {actionConfig[reviewModal.action].description}
              </p>

              <label className='mt-5 block'>
                <span className='text-sm font-bold text-slate-800'>
                  Feedback for instructor
                  {actionConfig[reviewModal.action].requiresNote ? (
                    <span className='ml-1 text-rose-600'>*</span>
                  ) : (
                    <span className='ml-1 font-normal text-slate-400'>
                      (optional)
                    </span>
                  )}
                </span>

                <textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder='Write a clear and helpful review note...'
                  rows={5}
                  maxLength={2000}
                  disabled={isSubmitting}
                  className='mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
                />
              </label>

              <div className='mt-1 flex justify-between text-xs text-slate-400'>
                <span>
                  {actionConfig[reviewModal.action].requiresNote
                    ? 'At least 10 characters required'
                    : 'Optional for publishing'}
                </span>

                <span>{reviewNote.trim().length}/2000</span>
              </div>

              {actionError && (
                <div className='mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700'>
                  <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
                  <p>{actionError}</p>
                </div>
              )}
            </div>

            <div className='flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={closeReviewModal}
                disabled={isSubmitting}
                className='h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Cancel
              </button>

              <button
                type='button'
                onClick={() => void submitReview()}
                disabled={isSubmitting}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  actionConfig[reviewModal.action].buttonClassName
                }`}
              >
                {isSubmitting ? (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                ) : reviewModal.action === 'PUBLISH' ? (
                  <CheckCircle2 className='h-4 w-4' />
                ) : reviewModal.action === 'REJECT' ? (
                  <CircleX className='h-4 w-4' />
                ) : (
                  <Send className='h-4 w-4' />
                )}

                {isSubmitting
                  ? 'Saving...'
                  : actionConfig[reviewModal.action].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
