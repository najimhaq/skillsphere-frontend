import Link from 'next/link';

import type { Pagination } from '@/types/course';

type CoursePaginationProps = {
  pagination: Pagination;
  search?: string;
  category?: string;
  level?: string;
};

function createPageHref(
  page: number,
  search?: string,
  category?: string,
  level?: string
) {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (search) {
    params.set('search', search);
  }

  if (category) {
    params.set('category', category);
  }

  if (level) {
    params.set('level', level);
  }

  return `/courses?${params.toString()}`;
}

export function CoursePagination({
  pagination,
  search,
  category,
  level,
}: CoursePaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className='mt-10 flex items-center justify-center gap-3'
      aria-label='Course pagination'
    >
      {pagination.hasPreviousPage ? (
        <Link
          href={createPageHref(pagination.page - 1, search, category, level)}
          className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700'
        >
          Previous
        </Link>
      ) : (
        <span className='cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400'>
          Previous
        </span>
      )}

      <span className='text-sm font-medium text-slate-600'>
        Page {pagination.page} of {pagination.totalPages}
      </span>

      {pagination.hasNextPage ? (
        <Link
          href={createPageHref(pagination.page + 1, search, category, level)}
          className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700'
        >
          Next
        </Link>
      ) : (
        <span className='cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400'>
          Next
        </span>
      )}
    </nav>
  );
}
