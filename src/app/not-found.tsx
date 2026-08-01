import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className='flex min-h-[70vh] items-center justify-center px-4 py-16'>
      <div className='max-w-md text-center'>
        <div className='mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600'>
          <SearchX className='size-7' aria-hidden='true' />
        </div>

        <p className='mt-6 text-sm font-bold uppercase tracking-[0.18em] text-indigo-600'>
          404 error
        </p>

        <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-950'>
          Course not found
        </h1>

        <p className='mt-4 leading-7 text-slate-600'>
          The course may not exist, may no longer be published, or the link is
          incorrect.
        </p>

        <Link
          href='/courses'
          className='mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700'
        >
          <ArrowLeft className='size-4' aria-hidden='true' />
          Browse all courses
        </Link>
      </div>
    </main>
  );
}
