'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  GraduationCap,
  LoaderCircle,
  Mail,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';

import {
  getInstructorStudents,
  type InstructorStudentsResponse,
} from '@/lib/instructor-students-api';

const formatDate = (value: string | null) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return initials || 'S';
};

const clampProgress = (progress: number) => {
  return Math.min(100, Math.max(0, progress));
};

export default function InstructorStudentsPage() {
  const [data, setData] = useState<InstructorStudentsResponse | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStudents = async (
    courseId = selectedCourseId,
    search = submittedSearch,
    showRefreshState = false
  ) => {
    if (showRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await getInstructorStudents({
        courseId: courseId || undefined,
        search: search || undefined,
      });

      setData(result);
      setError('');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load students.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStudents('', '');
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryCards = useMemo(() => {
    const summary = data?.summary ?? {
      totalStudents: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      completionRate: 0,
    };

    return [
      {
        label: 'Total students',
        value: summary.totalStudents,
        description: 'Across your courses',
        icon: Users,
        iconClassName: 'bg-indigo-100 text-indigo-600',
      },
      {
        label: 'Active learners',
        value: summary.activeEnrollments,
        description: 'Currently learning',
        icon: GraduationCap,
        iconClassName: 'bg-sky-100 text-sky-600',
      },
      {
        label: 'Completed',
        value: summary.completedEnrollments,
        description: 'Finished a course',
        icon: CheckCircle2,
        iconClassName: 'bg-emerald-100 text-emerald-600',
      },
      {
        label: 'Completion rate',
        value: `${summary.completionRate}%`,
        description: 'Of visible enrollments',
        icon: Award,
        iconClassName: 'bg-violet-100 text-violet-600',
      },
    ];
  }, [data]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    setSubmittedSearch(nextSearch);
    void loadStudents(selectedCourseId, nextSearch);
  };

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCourseId = event.target.value;

    setSelectedCourseId(nextCourseId);
    void loadStudents(nextCourseId, submittedSearch);
  };

  const handleRefresh = () => {
    void loadStudents(selectedCourseId, submittedSearch, true);
  };

  if (isLoading && !data) {
    return (
      <div className='grid min-h-96 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading your students...
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='text-sm font-semibold text-indigo-600'>
            Instructor dashboard
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Students
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Track enrollments and learning progress across your courses.
          </p>
        </div>

        <button
          type='button'
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </section>

      {error && (
        <div className='mt-6 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            <p>{error}</p>
          </div>

          <button
            type='button'
            onClick={handleRefresh}
            className='shrink-0 font-semibold underline underline-offset-2'
          >
            Try again
          </button>
        </div>
      )}

      {!error && (
        <>
          <section className='mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.label}
                  className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='text-sm font-medium text-slate-500'>
                        {card.label}
                      </p>

                      <p className='mt-2 text-2xl font-bold tracking-tight text-slate-900'>
                        {card.value}
                      </p>

                      <p className='mt-1 text-xs text-slate-500'>
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl ${card.iconClassName}`}
                    >
                      <Icon className='h-5 w-5' />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className='mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm'>
            <div className='flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h2 className='text-lg font-bold text-slate-900'>
                  Enrolled students
                </h2>

                <p className='mt-1 text-sm text-slate-500'>
                  View every student enrolled in your courses.
                </p>
              </div>

              <div className='flex flex-col gap-3 sm:flex-row'>
                <form
                  onSubmit={handleSearchSubmit}
                  className='relative min-w-0 sm:w-72'
                >
                  <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />

                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder='Search name or email...'
                    className='h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />
                </form>

                <div className='relative sm:w-64'>
                  <select
                    value={selectedCourseId}
                    onChange={handleCourseChange}
                    className='h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  >
                    <option value=''>All courses</option>

                    {data?.courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                </div>
              </div>
            </div>

            {isLoading && (
              <div className='flex items-center gap-2 border-b border-slate-100 px-5 py-3 text-sm font-medium text-slate-500'>
                <LoaderCircle className='h-4 w-4 animate-spin' />
                Updating students...
              </div>
            )}

            {data && data.students.length === 0 ? (
              <div className='grid min-h-80 place-items-center p-8 text-center'>
                <div className='max-w-sm'>
                  <div className='mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-indigo-600'>
                    <Users className='h-7 w-7' />
                  </div>

                  <h3 className='mt-4 text-lg font-bold text-slate-900'>
                    No students found
                  </h3>

                  <p className='mt-2 text-sm leading-6 text-slate-500'>
                    {submittedSearch || selectedCourseId
                      ? 'Try changing your search or course filter.'
                      : 'Students will appear here after they enroll in one of your published courses.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full min-w-230 text-left'>
                  <thead className='bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase'>
                    <tr>
                      <th className='px-5 py-4'>Student</th>
                      <th className='px-5 py-4'>Course</th>
                      <th className='px-5 py-4'>Progress</th>
                      <th className='px-5 py-4'>Status</th>
                      <th className='px-5 py-4'>Enrolled</th>
                      <th className='px-5 py-4'>Completed</th>
                    </tr>
                  </thead>

                  <tbody className='divide-y divide-slate-100'>
                    {data?.students.map((item) => {
                      const progress = clampProgress(item.progressPercentage);
                      const isCompleted =
                        item.status === 'COMPLETED' || progress === 100;

                      return (
                        <tr
                          key={item.enrollmentId}
                          className='transition hover:bg-slate-50/70'
                        >
                          <td className='px-5 py-4'>
                            <div className='flex min-w-56 items-center gap-3'>
                              {item.student.image ? (
                                <Image
                                  src={item.student.image}
                                  alt={item.student.name}
                                  width={40}
                                  height={40}
                                  className='h-10 w-10 rounded-full object-cover'
                                />
                              ) : (
                                <div className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700'>
                                  {getInitials(item.student.name)}
                                </div>
                              )}

                              <div className='min-w-0'>
                                <p className='truncate text-sm font-semibold text-slate-900'>
                                  {item.student.name}
                                </p>

                                <p className='mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500'>
                                  <Mail className='h-3.5 w-3.5 shrink-0' />
                                  {item.student.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className='px-5 py-4'>
                            <div className='flex max-w-64 items-center gap-2'>
                              <BookOpen className='h-4 w-4 shrink-0 text-indigo-500' />

                              <p className='line-clamp-2 text-sm font-medium text-slate-700'>
                                {item.course.title}
                              </p>
                            </div>
                          </td>

                          <td className='px-5 py-4'>
                            <div className='w-36'>
                              <div className='flex items-center justify-between text-xs font-semibold text-slate-600'>
                                <span>{progress}%</span>
                              </div>

                              <div className='mt-2 h-2 overflow-hidden rounded-full bg-slate-100'>
                                <div
                                  className={`h-full rounded-full ${
                                    isCompleted
                                      ? 'bg-emerald-500'
                                      : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className='px-5 py-4'>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.status === 'CANCELLED'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-sky-50 text-sky-700'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className='h-3.5 w-3.5' />
                              ) : (
                                <CircleUserRound className='h-3.5 w-3.5' />
                              )}

                              {isCompleted
                                ? 'Completed'
                                : item.status === 'CANCELLED'
                                  ? 'Cancelled'
                                  : 'Active'}
                            </span>
                          </td>

                          <td className='whitespace-nowrap px-5 py-4 text-sm text-slate-600'>
                            {formatDate(item.enrolledAt)}
                          </td>

                          <td className='whitespace-nowrap px-5 py-4 text-sm text-slate-600'>
                            {isCompleted ? formatDate(item.completedAt) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
