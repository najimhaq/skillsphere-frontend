import Link from 'next/link';
import { ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <main className='grid min-h-[calc(100vh-4rem)] place-items-center bg-slate-50 px-4 py-10'>
      <section className='w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-10'>
        <div className='mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600'>
          <CheckCircle2 className='h-9 w-9' />
        </div>

        <h1 className='mt-6 text-2xl font-bold tracking-tight text-slate-900'>
          Payment received
        </h1>

        <p className='mt-3 text-sm leading-6 text-slate-600'>
          Your payment is being confirmed securely. Once Stripe webhook
          verification completes, the course will appear in your learning
          library.
        </p>

        <div className='mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-left'>
          <div className='flex items-start gap-3'>
            <GraduationCap className='mt-0.5 h-5 w-5 shrink-0 text-indigo-600' />

            <p className='text-sm leading-6 text-indigo-900'>
              If your course does not appear immediately, wait a few seconds and
              refresh your My Learning page.
            </p>
          </div>
        </div>

        <Link
          href='/dashboard/student/my-learning'
          className='mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700'
        >
          Go to My Learning
          <ArrowRight className='h-4 w-4' />
        </Link>

        <Link
          href='/courses'
          className='mt-3 inline-flex text-sm font-semibold text-slate-600 transition hover:text-indigo-600'
        >
          Browse more courses
        </Link>
      </section>
    </main>
  );
}
