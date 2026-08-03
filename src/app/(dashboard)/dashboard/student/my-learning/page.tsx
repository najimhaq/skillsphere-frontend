'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  Compass,
  GraduationCap,
  LoaderCircle,
} from 'lucide-react';

import {
  getMyEnrollments,
  type StudentEnrollment,
} from '@/lib/student-enrollment-api';

const formatEnrollmentDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getLevelLabel = (level: StudentEnrollment['courseId']['level']) => {
  return level.charAt(0) + level.slice(1).toLowerCase();
};

const getProgressLabel = (enrollment: StudentEnrollment, progress: number) => {
  if (enrollment.status === 'COMPLETED' || progress === 100) {
    return 'Completed';
  }

  if (progress > 0) {
    return 'In progress';
  }

  return 'Not started';
};

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadEnrollments = async () => {
      try {
        const data = await getMyEnrollments();

        if (!isCancelled) {
          setEnrollments(data);
          setError('');
        }
      } catch (caughtError) {
        if (!isCancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load your courses.'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadEnrollments();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className='grid min-h-80 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading your learning library...
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-indigo-600'>
            Student dashboard
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            My learning
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Continue learning from the courses you have enrolled in.
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

      {!error && enrollments.length === 0 && (
        <section className='mt-8 grid min-h-96 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center'>
          <div className='max-w-md'>
            <div className='mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-indigo-600'>
              <BookOpen className='h-7 w-7' />
            </div>

            <h2 className='mt-4 text-xl font-bold text-slate-900'>
              Your learning library is empty
            </h2>

            <p className='mt-2 text-sm leading-6 text-slate-500'>
              Browse published courses and enroll to begin learning.
            </p>

            <Link
              href='/courses'
              className='mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700'
            >
              <Compass className='h-4 w-4' />
              Explore courses
            </Link>
          </div>
        </section>
      )}

      {!error && enrollments.length > 0 && (
        <section className='mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {enrollments.map((enrollment) => {
            const course = enrollment.courseId;

            const progress = Math.min(
              100,
              Math.max(0, enrollment.progressPercentage)
            );

            const isCompleted =
              enrollment.status === 'COMPLETED' || progress === 100;

            const progressLabel = getProgressLabel(enrollment, progress);

            const actionLabel = isCompleted
              ? 'Review course'
              : progress > 0
                ? 'Continue learning'
                : 'Start course';

            return (
              <article
                key={enrollment._id}
                className='flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md'
              >
                <div className='relative h-44 w-full bg-slate-100'>
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
                      className='object-cover'
                    />
                  ) : (
                    <div className='grid h-full place-items-center bg-linear-to-br from-indigo-100 to-violet-100 text-indigo-600'>
                      <GraduationCap className='h-11 w-11' />
                    </div>
                  )}

                  {isCompleted && (
                    <div className='absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm'>
                      <CheckCircle2 className='h-3.5 w-3.5' />
                      Completed
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

                  <h2 className='mt-3 line-clamp-2 text-lg font-bold text-slate-900'>
                    {course.title}
                  </h2>

                  <p className='mt-2 line-clamp-2 text-sm leading-6 text-slate-600'>
                    {course.shortDescription}
                  </p>

                  <div className='mt-5'>
                    <div className='flex items-center justify-between text-xs font-semibold text-slate-600'>
                      <span>{progressLabel}</span>
                      <span>{progress}%</span>
                    </div>

                    <div className='mt-2 h-2 overflow-hidden rounded-full bg-slate-100'>
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className='mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4'>
                    <div className='text-xs text-slate-500'>
                      {isCompleted && enrollment.completedAt ? (
                        <span className='inline-flex items-center gap-1'>
                          <Award className='h-3.5 w-3.5 text-emerald-600' />
                          Completed{' '}
                          {formatEnrollmentDate(enrollment.completedAt)}
                        </span>
                      ) : (
                        <span>
                          Enrolled {formatEnrollmentDate(enrollment.enrolledAt)}
                        </span>
                      )}
                    </div>

                    <div className='flex shrink-0 items-center gap-3'>
                      {isCompleted && (
                        <Link
                          href={`/dashboard/student/certificates/${course._id}`}
                          className='inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800'
                        >
                          <Award className='h-4 w-4' />
                          Certificate
                        </Link>
                      )}

                      <Link
                        href={`/learn/${course._id}`}
                        className={`inline-flex items-center gap-1 text-sm font-semibold transition ${
                          isCompleted
                            ? 'text-slate-700 hover:text-slate-900'
                            : 'text-indigo-600 hover:text-indigo-700'
                        }`}
                      >
                        {actionLabel}

                        {isCompleted ? (
                          <BookOpen className='h-4 w-4' />
                        ) : progress > 0 ? (
                          <ArrowRight className='h-4 w-4' />
                        ) : (
                          <CirclePlay className='h-4 w-4' />
                        )}
                      </Link>
                    </div>
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
