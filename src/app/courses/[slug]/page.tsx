import Image from 'next/image';
import Link from 'next/link';
import { EnrollButton } from '@/components/courses/enroll-button';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  Clock3,
  GraduationCap,
  UsersRound,
} from 'lucide-react';

import { getCourseBySlug } from '@/lib/course-api';

type CourseDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatLevel(level: string) {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

function formatPrice(price: number) {
  return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;

  const response = await getCourseBySlug(slug);

  if (!response) {
    notFound();
  }

  const { data: course } = response;

  return (
    <main>
      <section className='bg-slate-950'>
        <div className='mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:items-center lg:px-8 lg:py-16'>
          <div>
            <Link
              href='/courses'
              className='inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white'
            >
              <ArrowLeft className='size-4' aria-hidden='true' />
              Back to courses
            </Link>

            <div className='mt-7 flex flex-wrap gap-2 text-xs font-bold'>
              <span className='rounded-full bg-indigo-400/15 px-3 py-1.5 text-indigo-200'>
                {course.category}
              </span>

              <span className='rounded-full bg-white/10 px-3 py-1.5 text-slate-200'>
                {formatLevel(course.level)}
              </span>
            </div>

            <h1 className='mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl'>
              {course.title}
            </h1>

            <p className='mt-5 max-w-2xl text-lg leading-8 text-slate-300'>
              {course.shortDescription}
            </p>

            <div className='mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300'>
              <span className='inline-flex items-center gap-2'>
                <BookOpen
                  className='size-4 text-indigo-300'
                  aria-hidden='true'
                />
                Practical learning
              </span>

              <span className='inline-flex items-center gap-2'>
                <CirclePlay
                  className='size-4 text-indigo-300'
                  aria-hidden='true'
                />
                Learn at your own pace
              </span>

              <span className='inline-flex items-center gap-2'>
                <BadgeCheck
                  className='size-4 text-indigo-300'
                  aria-hidden='true'
                />
                Completion tracking
              </span>
            </div>
          </div>

          <div className='overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl'>
            <div className='relative aspect-video'>
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                preload
                sizes='(min-width: 1024px) 420px, 100vw'
                className='object-cover'
              />
            </div>

            <div className='p-5'>
              <div className='flex items-center justify-between'>
                <span className='text-2xl font-bold text-white'>
                  {formatPrice(course.price)}
                </span>

                <span className='text-sm font-medium text-slate-400'>
                  Lifetime access
                </span>
              </div>

              <EnrollButton courseId={course._id} price={course.price} />

              <p className='mt-3 text-center text-xs text-slate-400'>
                {course.price === 0
                  ? 'Enroll for free and start learning at your own pace.'
                  : 'Secure payment is processed by Stripe Checkout.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-slate-950'>
            About this course
          </h2>

          <p className='mt-5 whitespace-pre-line leading-8 text-slate-700'>
            {course.description}
          </p>

          <div className='mt-10'>
            <h2 className='text-2xl font-bold tracking-tight text-slate-950'>
              What you will get
            </h2>

            <div className='mt-5 grid gap-3 sm:grid-cols-2'>
              {[
                'Structured lessons built around practical skills',
                'Learning progress tracked in your dashboard',
                'Access to the course after enrollment',
                'A clear path from fundamentals to confidence',
              ].map((item) => (
                <div
                  key={item}
                  className='flex gap-3 rounded-xl border border-slate-200 bg-white p-4'
                >
                  <CheckCircle2
                    className='mt-0.5 size-5 shrink-0 text-emerald-500'
                    aria-hidden='true'
                  />
                  <p className='text-sm leading-6 text-slate-700'>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className='h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-slate-950'>Course details</h2>

          <dl className='mt-5 space-y-4 text-sm'>
            <div className='flex items-center justify-between gap-4'>
              <dt className='inline-flex items-center gap-2 text-slate-600'>
                <GraduationCap className='size-4 text-indigo-600' />
                Level
              </dt>
              <dd className='font-semibold text-slate-950'>
                {formatLevel(course.level)}
              </dd>
            </div>

            <div className='flex items-center justify-between gap-4'>
              <dt className='inline-flex items-center gap-2 text-slate-600'>
                <Clock3 className='size-4 text-indigo-600' />
                Access
              </dt>
              <dd className='font-semibold text-slate-950'>Lifetime</dd>
            </div>

            <div className='flex items-center justify-between gap-4'>
              <dt className='inline-flex items-center gap-2 text-slate-600'>
                <UsersRound className='size-4 text-indigo-600' />
                Format
              </dt>
              <dd className='font-semibold text-slate-950'>Self-paced</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
