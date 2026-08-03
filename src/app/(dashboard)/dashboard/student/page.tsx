'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  Compass,
  GraduationCap,
  LoaderCircle,
  PlayCircle,
  Trophy,
} from 'lucide-react';

import {
  getStudentDashboardOverview,
  type StudentDashboardOverview,
} from '@/lib/student-dashboard-api';

type DashboardStat = {
  label: string;
  value: number;
  description: string;
  icon: typeof GraduationCap;
  iconClassName: string;
};

const getLevelLabel = (level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => {
  return level.charAt(0) + level.slice(1).toLowerCase();
};

export default function StudentDashboardPage() {
  const [overview, setOverview] = useState<StudentDashboardOverview | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadDashboard = async () => {
      try {
        const data = await getStudentDashboardOverview();

        if (!isCancelled) {
          setOverview(data);
          setError('');
        }
      } catch (caughtError) {
        if (!isCancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load your dashboard.'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className='grid min-h-80 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const stats: DashboardStat[] = [
    {
      label: 'Courses enrolled',
      value: overview?.stats.coursesEnrolled ?? 0,
      description: 'Courses in your learning library',
      icon: GraduationCap,
      iconClassName: 'bg-indigo-100 text-indigo-600',
    },
    {
      label: 'Lessons completed',
      value: overview?.stats.lessonsCompleted ?? 0,
      description: 'Keep learning one lesson at a time',
      icon: CirclePlay,
      iconClassName: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Certificates earned',
      value: overview?.stats.certificatesEarned ?? 0,
      description: 'Complete a course to earn one',
      icon: Trophy,
      iconClassName: 'bg-amber-100 text-amber-600',
    },
  ];

  const continueLearning = overview?.continueLearning ?? [];

  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-indigo-600'>
            Student dashboard
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Welcome back
            {overview?.student.name ? `, ${overview.student.name}` : ''}
          </h1>

          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
            Track your courses, continue learning, and discover new skills.
          </p>
        </div>

        <Link
          href='/courses'
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
        >
          <Compass className='h-4 w-4' />
          Browse courses
        </Link>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
          <p>{error}</p>
        </div>
      )}

      <section className='mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {stats.map((stat) => {
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
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ${stat.iconClassName}`}
                >
                  <Icon className='h-5 w-5' />
                </div>
              </div>

              <p className='mt-4 text-sm text-slate-500'>{stat.description}</p>
            </article>
          );
        })}
      </section>

      <section className='mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-lg font-bold text-slate-900'>
              Continue learning
            </h2>

            <p className='mt-1 text-sm text-slate-500'>
              Resume where you left off.
            </p>
          </div>

          <Link
            href='/dashboard/student/my-learning'
            className='inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700'
          >
            View my learning
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>

        {error && !overview ? (
          <div className='grid min-h-72 place-items-center p-8 text-center'>
            <div className='max-w-md'>
              <div className='mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-rose-600'>
                <AlertCircle className='h-7 w-7' />
              </div>

              <h3 className='mt-4 text-lg font-bold text-slate-900'>
                Dashboard unavailable
              </h3>

              <p className='mt-2 text-sm leading-6 text-slate-500'>
                Please refresh the page and try again.
              </p>
            </div>
          </div>
        ) : continueLearning.length === 0 ? (
          <div className='grid min-h-72 place-items-center p-8 text-center'>
            <div className='max-w-md'>
              <div className='mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-indigo-600'>
                <BookOpen className='h-7 w-7' />
              </div>

              <h3 className='mt-4 text-lg font-bold text-slate-900'>
                Start your learning journey
              </h3>

              <p className='mt-2 text-sm leading-6 text-slate-500'>
                Browse published courses and enroll in a course to see it here.
              </p>

              <Link
                href='/courses'
                className='mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
              >
                <Compass className='h-4 w-4' />
                Explore courses
              </Link>
            </div>
          </div>
        ) : (
          <div className='grid gap-5 p-5 lg:grid-cols-2 xl:grid-cols-3'>
            {continueLearning.map((course) => {
              const progress = Math.min(
                100,
                Math.max(0, course.progressPercentage)
              );

              return (
                <article
                  key={course.enrollmentId}
                  className='flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white'
                >
                  <div className='relative h-40 w-full bg-slate-100'>
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        sizes='(max-width: 1024px) 100vw, 33vw'
                        className='object-cover'
                      />
                    ) : (
                      <div className='grid h-full place-items-center bg-linear-to-br from-indigo-100 to-violet-100 text-indigo-600'>
                        <GraduationCap className='h-10 w-10' />
                      </div>
                    )}
                  </div>

                  <div className='flex flex-1 flex-col p-5'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-xs font-bold tracking-wide text-indigo-600 uppercase'>
                        {course.category}
                      </p>

                      <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                        {getLevelLabel(course.level)}
                      </span>
                    </div>

                    <h3 className='mt-3 line-clamp-2 text-lg font-bold text-slate-900'>
                      {course.title}
                    </h3>

                    <p className='mt-2 line-clamp-2 text-sm leading-6 text-slate-600'>
                      {course.shortDescription}
                    </p>

                    <div className='mt-5'>
                      <div className='flex items-center justify-between text-xs font-semibold text-slate-600'>
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>

                      <div className='mt-2 h-2 overflow-hidden rounded-full bg-slate-100'>
                        <div
                          className='h-full rounded-full bg-indigo-600 transition-all duration-300'
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/learn/${course.courseId}`}
                      className='mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700'
                    >
                      {progress > 0 ? 'Continue learning' : 'Start course'}
                      {progress > 0 ? (
                        <ArrowRight className='h-4 w-4' />
                      ) : (
                        <PlayCircle className='h-4 w-4' />
                      )}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {overview?.stats.certificatesEarned ? (
        <section className='mt-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3'>
            <div className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700'>
              <Trophy className='h-5 w-5' />
            </div>

            <div>
              <h2 className='font-bold text-amber-950'>
                You have earned {overview.stats.certificatesEarned}{' '}
                {overview.stats.certificatesEarned === 1
                  ? 'certificate'
                  : 'certificates'}
              </h2>

              <p className='mt-1 text-sm text-amber-800'>
                View completed courses and download your achievement
                certificates.
              </p>
            </div>
          </div>

          <Link
            href='/dashboard/student/my-learning'
            className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100'
          >
            <CheckCircle2 className='h-4 w-4' />
            View certificates
          </Link>
        </section>
      ) : null}
    </div>
  );
}
