'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Layers3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';

type RecentCourse = {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  status: CourseStatus;
  category: string;
  level: string;
  createdAt: string;
  updatedAt: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
};

type AdminOverview = {
  users: {
    total: number;
    active: number;
    students: number;
    instructors: number;
    admins: number;
  };
  courses: {
    total: number;
    draft: number;
    pendingReview: number;
    published: number;
    rejected: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  recentCourses: RecentCourse[];
};

type ApiResponse = {
  success: true;
  data: AdminOverview;
};

const getStatusStyle = (status: CourseStatus) => {
  const statusMap: Record<
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
  };

  return statusMap[status];
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
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'I'
  );
};

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const pendingReviewMessage = useMemo(() => {
    if (!overview) {
      return '';
    }

    if (overview.courses.pendingReview === 0) {
      return 'There are no courses waiting for review.';
    }

    if (overview.courses.pendingReview === 1) {
      return '1 course is waiting for your review.';
    }

    return `${overview.courses.pendingReview} courses are waiting for your review.`;
  }, [overview]);

  const loadOverview = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError('');

    try {
      const response = await fetch(`${API_URL}/api/admin/overview`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const result = (await response.json()) as
        | ApiResponse
        | { success: false; message?: string };

      if (!response.ok || !result.success) {
        throw new Error(
          'message' in result
            ? result.message || 'Unable to load dashboard data.'
            : 'Unable to load dashboard data.'
        );
      }

      setOverview(result.data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load dashboard data.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      await loadOverview();
    };

    void initializeDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className='grid min-h-96 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className='mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Unable to load admin dashboard</p>
            <p className='mt-1'>{error || 'Please refresh and try again.'}</p>

            <button
              type='button'
              onClick={() => void loadOverview()}
              className='mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700'
            >
              <RefreshCw className='h-4 w-4' />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryStats = [
    {
      label: 'Total users',
      value: overview.users.total,
      description: `${overview.users.active} active accounts`,
      icon: Users,
      iconClassName: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Instructors',
      value: overview.users.instructors,
      description: `${overview.users.students} students enrolled`,
      icon: GraduationCap,
      iconClassName: 'bg-violet-100 text-violet-700',
    },
    {
      label: 'Total courses',
      value: overview.courses.total,
      description: `${overview.courses.published} published courses`,
      icon: BookOpen,
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Total enrollments',
      value: overview.enrollments.total,
      description: `${overview.enrollments.completed} completed`,
      icon: Layers3,
      iconClassName: 'bg-orange-100 text-orange-700',
    },
  ];

  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-indigo-600'>
            Platform administration
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Admin overview
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Monitor activity, review courses, and manage the SkillSphere
            platform.
          </p>
        </div>

        <button
          type='button'
          onClick={() => void loadOverview(true)}
          disabled={isRefreshing}
          className='inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
          <p>{error}</p>
        </div>
      )}

      <section className='mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {primaryStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-sm font-medium text-slate-500'>
                    {stat.label}
                  </p>

                  <p className='mt-2 text-3xl font-bold tracking-tight text-slate-900'>
                    {stat.value.toLocaleString()}
                  </p>
                </div>

                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl ${stat.iconClassName}`}
                >
                  <Icon className='h-5 w-5' />
                </div>
              </div>

              <p className='mt-4 text-xs text-slate-500'>{stat.description}</p>
            </article>
          );
        })}
      </section>

      <section className='mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]'>
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
            <div>
              <h2 className='text-lg font-bold text-slate-900'>
                Recent courses
              </h2>

              <p className='mt-1 text-sm text-slate-500'>
                Latest courses created across the platform.
              </p>
            </div>

            <Link
              href='/dashboard/admin/courses'
              className='inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
            >
              View all
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>

          {overview.recentCourses.length === 0 ? (
            <div className='grid min-h-64 place-items-center p-6 text-center'>
              <div>
                <BookOpen className='mx-auto h-10 w-10 text-slate-300' />
                <h3 className='mt-3 text-sm font-bold text-slate-700'>
                  No courses yet
                </h3>
                <p className='mt-1 text-sm text-slate-500'>
                  Courses created by instructors will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-175 text-left'>
                <thead className='bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase'>
                  <tr>
                    <th className='px-5 py-3.5 sm:px-6'>Course</th>
                    <th className='px-5 py-3.5'>Instructor</th>
                    <th className='px-5 py-3.5'>Status</th>
                    <th className='px-5 py-3.5 sm:px-6'>Created</th>
                  </tr>
                </thead>

                <tbody className='divide-y divide-slate-100'>
                  {overview.recentCourses.map((course) => {
                    const status = getStatusStyle(course.status);

                    return (
                      <tr key={course._id} className='hover:bg-slate-50/70'>
                        <td className='px-5 py-4 sm:px-6'>
                          <div className='min-w-50'>
                            <p className='line-clamp-1 text-sm font-semibold text-slate-800'>
                              {course.title}
                            </p>

                            <p className='mt-1 text-xs text-slate-500'>
                              {course.category} · {course.level}
                            </p>
                          </div>
                        </td>

                        <td className='px-5 py-4'>
                          {course.instructor ? (
                            <div className='flex items-center gap-2.5'>
                              <div className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700'>
                                {getInitials(course.instructor.name)}
                              </div>

                              <div className='min-w-0'>
                                <p className='max-w-36 truncate text-sm font-medium text-slate-700'>
                                  {course.instructor.name}
                                </p>

                                <p className='max-w-36 truncate text-xs text-slate-500'>
                                  {course.instructor.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className='text-sm text-slate-400'>
                              Unknown instructor
                            </span>
                          )}
                        </td>

                        <td className='px-5 py-4'>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className='px-5 py-4 text-sm text-slate-500 sm:px-6'>
                          {formatDate(course.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className='space-y-6'>
          <section className='rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm'>
            <div className='flex items-start gap-3'>
              <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700'>
                <ClipboardCheck className='h-5 w-5' />
              </div>

              <div>
                <p className='text-sm font-bold text-amber-950'>
                  Course review queue
                </p>

                <p className='mt-1 text-sm leading-6 text-amber-800'>
                  {pendingReviewMessage}
                </p>
              </div>
            </div>

            <Link
              href='/dashboard/admin/courses?status=PENDING_REVIEW'
              className='mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700'
            >
              Review courses
              <ArrowRight className='h-4 w-4' />
            </Link>
          </section>

          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-start gap-3'>
              <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600'>
                <ShieldCheck className='h-5 w-5' />
              </div>

              <div>
                <h2 className='text-base font-bold text-slate-900'>
                  Platform snapshot
                </h2>

                <p className='mt-1 text-sm text-slate-500'>
                  Current platform distribution.
                </p>
              </div>
            </div>

            <div className='mt-5 divide-y divide-slate-100 border-y border-slate-100'>
              <div className='flex items-center justify-between py-3'>
                <span className='text-sm text-slate-600'>Students</span>
                <span className='text-sm font-bold text-slate-900'>
                  {overview.users.students.toLocaleString()}
                </span>
              </div>

              <div className='flex items-center justify-between py-3'>
                <span className='text-sm text-slate-600'>Instructors</span>
                <span className='text-sm font-bold text-slate-900'>
                  {overview.users.instructors.toLocaleString()}
                </span>
              </div>

              <div className='flex items-center justify-between py-3'>
                <span className='text-sm text-slate-600'>Pending review</span>
                <span className='text-sm font-bold text-amber-700'>
                  {overview.courses.pendingReview.toLocaleString()}
                </span>
              </div>

              <div className='flex items-center justify-between py-3'>
                <span className='text-sm text-slate-600'>
                  Active enrollments
                </span>
                <span className='text-sm font-bold text-slate-900'>
                  {overview.enrollments.active.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
              <Clock3 className='h-4 w-4 text-slate-500' />
              Course status
            </div>

            <div className='mt-4 grid grid-cols-2 gap-3'>
              <div className='rounded-xl bg-slate-50 p-3'>
                <p className='text-xs font-medium text-slate-500'>Draft</p>
                <p className='mt-1 text-xl font-bold text-slate-800'>
                  {overview.courses.draft.toLocaleString()}
                </p>
              </div>

              <div className='rounded-xl bg-amber-50 p-3'>
                <p className='text-xs font-medium text-amber-700'>Pending</p>
                <p className='mt-1 text-xl font-bold text-amber-900'>
                  {overview.courses.pendingReview.toLocaleString()}
                </p>
              </div>

              <div className='rounded-xl bg-emerald-50 p-3'>
                <p className='text-xs font-medium text-emerald-700'>
                  Published
                </p>
                <p className='mt-1 text-xl font-bold text-emerald-900'>
                  {overview.courses.published.toLocaleString()}
                </p>
              </div>

              <div className='rounded-xl bg-rose-50 p-3'>
                <p className='text-xs font-medium text-rose-700'>Rejected</p>
                <p className='mt-1 text-xl font-bold text-rose-900'>
                  {overview.courses.rejected.toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
        <div className='flex items-start gap-3'>
          <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700'>
            <CheckCircle2 className='h-5 w-5' />
          </div>

          <div>
            <h2 className='text-base font-bold text-slate-900'>
              Administration scope
            </h2>

            <p className='mt-1 text-sm leading-6 text-slate-500'>
              The next module will add the course review queue, where you can
              inspect submitted course content and publish, reject, or request
              changes from the instructor.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
