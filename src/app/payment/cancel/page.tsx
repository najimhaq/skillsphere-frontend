import Link from 'next/link';
import { ArrowLeft, CircleX, ShieldCheck } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <main className='grid min-h-[calc(100vh-4rem)] place-items-center bg-slate-50 px-4 py-10'>
      <section className='w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10'>
        <div className='mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-600'>
          <CircleX className='h-9 w-9' />
        </div>

        <h1 className='mt-6 text-2xl font-bold tracking-tight text-slate-900'>
          Checkout cancelled
        </h1>

        <p className='mt-3 text-sm leading-6 text-slate-600'>
          No payment was completed and you have not been enrolled in the course.
          You can return to the course whenever you are ready.
        </p>

        <div className='mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left'>
          <ShieldCheck className='mt-0.5 h-5 w-5 shrink-0 text-indigo-600' />

          <p className='text-sm leading-6 text-slate-700'>
            Your payment details are securely handled by Stripe. SkillSphere
            does not store your card number.
          </p>
        </div>

        <Link
          href='/courses'
          className='mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to courses
        </Link>
      </section>
    </main>
  );
}
