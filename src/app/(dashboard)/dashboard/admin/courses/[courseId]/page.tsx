'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleX,
  Clock3,
  FileText,
  Layers3,
  LoaderCircle,
  PlayCircle,
  Send,
  UserRound,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type CourseStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

type LessonType = 'VIDEO' | 'ARTICLE';

type ReviewAction = 'PUBLISH' | 'REJECT' | 'REQUEST_CHANGES';

type Instructor = {
  _id: string;
  name: string;
  email: string;
  image: string | null;
};

type Lesson = {
  _id: string;
  title: string;
  type: LessonType;
  videoUrl: string | null;
  content: string | null;
  durationMinutes: number | null;
  isPreview: boolean;
  order: number;
};

type CourseSection = {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

type AdminCourse = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
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

type CourseDetailResponse = {
  success: true;
  data: {
    course: AdminCourse;
    sections: CourseSection[];
  };
};

type FailedResponse = {
  success: false;
  message?: string;
};

const actionConfig: Record<
  ReviewAction,
  {
    title: string;
    description: string;
    confirmLabel: string;
    buttonClassName: string;
    requiresNote: boolean;
  }
> = {
  PUBLISH: {
    title: 'Publish course',
    description:
      'This course will become public and students will be able to enroll.',
    confirmLabel: 'Publish course',
    buttonClassName: 'bg-emerald-600 hover:bg-emerald-700',
    requiresNote: false,
  },

  REJECT: {
    title: 'Reject course',
    description:
      'The instructor will receive your review note and can improve the course before submitting it again.',
    confirmLabel: 'Reject course',
    buttonClassName: 'bg-rose-600 hover:bg-rose-700',
    requiresNote: true,
  },

  REQUEST_CHANGES: {
    title: 'Request changes',
    description:
      'The course will return to draft status, allowing the instructor to improve and submit it again.',
    confirmLabel: 'Request changes',
    buttonClassName: 'bg-amber-600 hover:bg-amber-700',
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

export default function AdminCourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();

  const courseId = params.courseId;

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalLessons = useMemo(() => {
    return sections.reduce((total, section) => {
      return total + section.lessons.length;
    }, 0);
  }, [sections]);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    const controller = new AbortController();

    const fetchCourseDetail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/courses/${courseId}`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          }
        );

        const result = (await response.json()) as
          | CourseDetailResponse
          | FailedResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            getErrorMessage(result, 'Unable to load course details.')
          );
        }

        setCourse(result.data.course);
        setSections(result.data.sections);
        setExpandedSections(
          new Set(result.data.sections.map((section) => section._id))
        );
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
            : 'Unable to load course details.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoaded(true);
        }
      }
    };

    void fetchCourseDetail();

    return () => {
      controller.abort();
    };
  }, [courseId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((currentSections) => {
      const nextSections = new Set(currentSections);

      if (nextSections.has(sectionId)) {
        nextSections.delete(sectionId);
      } else {
        nextSections.add(sectionId);
      }

      return nextSections;
    });
  };

  const openReviewModal = (action: ReviewAction) => {
    setReviewAction(action);
    setReviewNote('');
    setActionError('');
  };

  const closeReviewModal = () => {
    if (isSubmitting) {
      return;
    }

    setReviewAction(null);
    setReviewNote('');
    setActionError('');
  };

  const submitReview = async () => {
    if (!reviewAction || !course) {
      return;
    }

    const config = actionConfig[reviewAction];
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
        `${API_URL}/api/admin/courses/${course._id}/review`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: reviewAction,
            reviewNote: normalizedNote || undefined,
          }),
        }
      );

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: AdminCourse;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to review this course.');
      }

      setCourse((currentCourse) => {
        if (!currentCourse || !result.data) {
          return currentCourse;
        }

        return {
          ...currentCourse,
          status: result.data.status,
          reviewNote: result.data.reviewNote,
          reviewedAt: result.data.reviewedAt,
          updatedAt: result.data.updatedAt,
        };
      });

      setReviewAction(null);
      setReviewNote('');
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

  if (!isLoaded) {
    return (
      <div className='grid min-h-96 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading course review...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Unable to load course</p>
            <p className='mt-1'>{error || 'Course could not be found.'}</p>

            <Link
              href='/dashboard/admin/courses'
              className='mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700'
            >
              Back to review queue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatusStyle(course.status);
  const canReview = course.status === 'PENDING_REVIEW';

  return (
    <div className='mx-auto max-w-6xl'>
      <section className='border-b border-slate-200 pb-8'>
        <Link
          href='/dashboard/admin/courses'
          className='inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to course review queue
        </Link>

        <div className='mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
              >
                {status.label}
              </span>

              <span className='text-sm font-medium text-slate-500'>
                {course.category} · {course.level}
              </span>
            </div>

            <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-900'>
              {course.title}
            </h1>

            <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
              {course.shortDescription}
            </p>
          </div>

          {canReview && (
            <div className='flex shrink-0 flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => openReviewModal('PUBLISH')}
                className='inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700'
              >
                <CheckCircle2 className='h-4 w-4' />
                Publish
              </button>

              <button
                type='button'
                onClick={() => openReviewModal('REQUEST_CHANGES')}
                className='inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 text-sm font-semibold text-white transition hover:bg-amber-600'
              >
                <Send className='h-4 w-4' />
                Request changes
              </button>

              <button
                type='button'
                onClick={() => openReviewModal('REJECT')}
                className='inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 text-sm font-semibold text-white transition hover:bg-rose-700'
              >
                <CircleX className='h-4 w-4' />
                Reject
              </button>
            </div>
          )}
        </div>
      </section>

      <section className='mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <main className='space-y-6'>
          <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
            <div className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-indigo-600' />
              <h2 className='text-lg font-bold text-slate-900'>
                Course description
              </h2>
            </div>

            <p className='mt-4 whitespace-pre-line text-sm leading-7 text-slate-600'>
              {course.description}
            </p>
          </article>

          <article className='rounded-2xl border border-slate-200 bg-white shadow-sm'>
            <div className='flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
              <div>
                <div className='flex items-center gap-2'>
                  <Layers3 className='h-5 w-5 text-indigo-600' />
                  <h2 className='text-lg font-bold text-slate-900'>
                    Course content
                  </h2>
                </div>

                <p className='mt-1 text-sm text-slate-500'>
                  {sections.length} section{sections.length === 1 ? '' : 's'} ·{' '}
                  {totalLessons} lesson{totalLessons === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {sections.length === 0 ? (
              <div className='p-8 text-center'>
                <BookOpen className='mx-auto h-10 w-10 text-slate-300' />
                <p className='mt-3 text-sm font-semibold text-slate-600'>
                  No course content added yet
                </p>
              </div>
            ) : (
              <div className='divide-y divide-slate-100'>
                {sections.map((section) => {
                  const isExpanded = expandedSections.has(section._id);

                  return (
                    <div key={section._id}>
                      <button
                        type='button'
                        onClick={() => toggleSection(section._id)}
                        className='flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50 sm:px-6'
                      >
                        <div>
                          <p className='text-sm font-bold text-slate-800'>
                            {section.order}. {section.title}
                          </p>

                          <p className='mt-1 text-xs text-slate-500'>
                            {section.lessons.length} lesson
                            {section.lessons.length === 1 ? '' : 's'}
                          </p>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className='h-5 w-5 text-slate-500' />
                        ) : (
                          <ChevronDown className='h-5 w-5 text-slate-500' />
                        )}
                      </button>

                      {isExpanded && (
                        <div className='border-t border-slate-100 bg-slate-50/70 px-5 py-2 sm:px-6'>
                          {section.lessons.length === 0 ? (
                            <p className='py-4 text-sm text-slate-500'>
                              No lessons in this section.
                            </p>
                          ) : (
                            section.lessons.map((lesson) => (
                              <div
                                key={lesson._id}
                                className='flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0'
                              >
                                <div className='flex min-w-0 items-center gap-3'>
                                  {lesson.type === 'VIDEO' ? (
                                    <PlayCircle className='h-5 w-5 shrink-0 text-indigo-600' />
                                  ) : (
                                    <FileText className='h-5 w-5 shrink-0 text-slate-500' />
                                  )}

                                  <div className='min-w-0'>
                                    <p className='truncate text-sm font-medium text-slate-700'>
                                      {lesson.order}. {lesson.title}
                                    </p>

                                    <p className='mt-0.5 text-xs text-slate-500'>
                                      {lesson.type === 'VIDEO'
                                        ? 'Video lesson'
                                        : 'Article lesson'}
                                      {lesson.isPreview ? ' · Preview' : ''}
                                    </p>
                                  </div>
                                </div>

                                <div className='shrink-0 text-xs font-medium text-slate-500'>
                                  {lesson.durationMinutes
                                    ? `${lesson.durationMinutes} min`
                                    : '—'}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </main>

        <aside className='space-y-6'>
          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center gap-2'>
              <UserRound className='h-5 w-5 text-indigo-600' />
              <h2 className='text-base font-bold text-slate-900'>Instructor</h2>
            </div>

            <div className='mt-4 flex items-center gap-3'>
              <div className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700'>
                {course.instructor ? getInitials(course.instructor.name) : 'I'}
              </div>

              <div className='min-w-0'>
                <p className='truncate text-sm font-bold text-slate-800'>
                  {course.instructor?.name ?? 'Unknown instructor'}
                </p>

                <p className='truncate text-xs text-slate-500'>
                  {course.instructor?.email ?? 'No email available'}
                </p>
              </div>
            </div>
          </section>

          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center gap-2'>
              <Clock3 className='h-5 w-5 text-indigo-600' />
              <h2 className='text-base font-bold text-slate-900'>
                Course details
              </h2>
            </div>

            <div className='mt-4 divide-y divide-slate-100 border-y border-slate-100'>
              <div className='flex items-center justify-between gap-4 py-3'>
                <span className='text-sm text-slate-500'>Price</span>
                <span className='text-sm font-bold text-slate-800'>
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </span>
              </div>

              <div className='flex items-center justify-between gap-4 py-3'>
                <span className='text-sm text-slate-500'>Created</span>
                <span className='text-sm font-semibold text-slate-800'>
                  {formatDate(course.createdAt)}
                </span>
              </div>

              <div className='flex items-center justify-between gap-4 py-3'>
                <span className='text-sm text-slate-500'>Last updated</span>
                <span className='text-sm font-semibold text-slate-800'>
                  {formatDate(course.updatedAt)}
                </span>
              </div>
            </div>
          </section>

          {course.reviewNote && (
            <section className='rounded-2xl border border-amber-200 bg-amber-50 p-5'>
              <h2 className='text-sm font-bold text-amber-950'>
                Latest review note
              </h2>

              <p className='mt-2 text-sm leading-6 text-amber-800'>
                {course.reviewNote}
              </p>

              {course.reviewedAt && (
                <p className='mt-3 text-xs font-medium text-amber-700'>
                  Reviewed {formatDate(course.reviewedAt)}
                </p>
              )}
            </section>
          )}
        </aside>
      </section>

      {reviewAction && (
        <div
          className='fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4'
          role='presentation'
          onMouseDown={closeReviewModal}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='course-review-modal-title'
            className='w-full max-w-lg rounded-2xl bg-white shadow-2xl'
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className='flex items-start justify-between gap-4 border-b border-slate-100 p-5'>
              <div>
                <h2
                  id='course-review-modal-title'
                  className='text-lg font-bold text-slate-900'
                >
                  {actionConfig[reviewAction].title}
                </h2>

                <p className='mt-1 text-sm text-slate-500'>{course.title}</p>
              </div>

              <button
                type='button'
                onClick={closeReviewModal}
                disabled={isSubmitting}
                className='rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Close
              </button>
            </div>

            <div className='p-5'>
              <p className='text-sm leading-6 text-slate-600'>
                {actionConfig[reviewAction].description}
              </p>

              <label className='mt-5 block'>
                <span className='text-sm font-bold text-slate-800'>
                  Feedback for instructor
                  {actionConfig[reviewAction].requiresNote ? (
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
                  rows={5}
                  maxLength={2000}
                  disabled={isSubmitting}
                  placeholder='Write clear and helpful feedback...'
                  className='mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
                />
              </label>

              <div className='mt-1 flex justify-between text-xs text-slate-400'>
                <span>
                  {actionConfig[reviewAction].requiresNote
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
                  actionConfig[reviewAction].buttonClassName
                }`}
              >
                {isSubmitting ? (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                ) : reviewAction === 'PUBLISH' ? (
                  <CheckCircle2 className='h-4 w-4' />
                ) : reviewAction === 'REJECT' ? (
                  <CircleX className='h-4 w-4' />
                ) : (
                  <Send className='h-4 w-4' />
                )}

                {isSubmitting
                  ? 'Saving...'
                  : actionConfig[reviewAction].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
