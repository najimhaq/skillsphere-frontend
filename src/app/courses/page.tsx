import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

import { CourseCard } from '@/components/courses/course-card';
import { CourseFilters } from '@/components/courses/course-filters';
import { CoursePagination } from '@/components/courses/course-pagination';
import { getCourses } from '@/lib/course-api';

type CoursesPageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    category?: string;
    level?: string;
    search?: string;
  }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const query = await searchParams;

  const coursesResponse = await getCourses({
    page: query.page,
    limit: '9',
    category: query.category,
    level: query.level,
    search: query.search,
  });

  const { data: courses, pagination } = coursesResponse;

  return (
    <main>
      <section className='border-b border-slate-200 bg-slate-950'>
        <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
          <div className='max-w-3xl'>
            <div className='inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1.5 text-sm font-medium text-indigo-100'>
              <BookOpen className='size-4' aria-hidden='true' />
              Explore the catalog
            </div>

            <h1 className='mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl'>
              Learn skills that make a difference.
            </h1>

            <p className='mt-5 max-w-2xl text-lg leading-8 text-slate-300'>
              Browse practical courses created to help you learn with focus,
              build confidence, and grow at your own pace.
            </p>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
        <CourseFilters
          search={query.search}
          category={query.category}
          level={query.level}
        />

        <div className='mt-8 flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm text-slate-600'>
            <span className='font-bold text-slate-950'>
              {pagination.totalCourses}
            </span>{' '}
            course{pagination.totalCourses === 1 ? '' : 's'} found
          </p>

          {(query.search || query.category || query.level) && (
            <Link
              href='/courses'
              className='text-sm font-semibold text-indigo-600 transition hover:text-indigo-800'
            >
              Clear filters
            </Link>
          )}
        </div>

        {courses.length > 0 ? (
          <>
            <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            <CoursePagination
              pagination={pagination}
              search={query.search}
              category={query.category}
              level={query.level}
            />
          </>
        ) : (
          <div className='mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
            <BookOpen
              className='mx-auto size-10 text-slate-400'
              aria-hidden='true'
            />

            <h2 className='mt-4 text-xl font-bold text-slate-950'>
              No courses found
            </h2>

            <p className='mx-auto mt-2 max-w-md text-slate-600'>
              Try changing your search term or removing one of the filters.
            </p>

            <Link
              href='/courses'
              className='mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700'
            >
              Browse all courses
              <ArrowRight className='size-4' aria-hidden='true' />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
