// frontend - src/components/courses/course-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { Course } from '@/types/course';

type CourseCardProps = {
  course: Course;
  priority?: boolean;
};

export function CourseCard({ course, priority=false }: CourseCardProps) {
  const formattedPrice =
    course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`;

  return (
    <article className='group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg'>
      <Link
        href={`/courses/${course.slug}`}
        className='block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset'
      >
        <div className='relative aspect-video overflow-hidden bg-slate-100'>
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            priority={priority}
            sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            className='object-cover transition duration-500 group-hover:scale-105'
          />
        </div>

        <div className='p-5'>
          <div className='flex flex-wrap items-center gap-2 text-xs font-semibold'>
            <span className='rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700'>
              {course.category}
            </span>

            <span className='rounded-full bg-slate-100 px-2.5 py-1 text-slate-600'>
              {course.level.toLowerCase()}
            </span>
          </div>

          <h2 className='mt-4 line-clamp-2 text-lg font-bold tracking-tight text-slate-950'>
            {course.title}
          </h2>

          <p className='mt-2 line-clamp-2 text-sm leading-6 text-slate-600'>
            {course.shortDescription}
          </p>

          <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-4'>
            <span className='text-lg font-bold text-slate-950'>
              {formattedPrice}
            </span>

            <span className='inline-flex items-center gap-1 text-sm font-semibold text-indigo-600'>
              View course
              <ArrowRight className='size-4 transition group-hover:translate-x-1' />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
