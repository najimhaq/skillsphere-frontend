'use client';

import { useEffect, useState, type SubmitEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import { authClient } from '@/lib/auth-client';

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace('/dashboard');
    }
  }, [isPending, router, session?.user]);

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setIsGoogleSigningIn(true);
      setError('');

      const { error: googleSignInError } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (googleSignInError) {
        setError(
          googleSignInError.message ?? 'Unable to continue with Google.'
        );
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to continue with Google.'
      );
    } finally {
      setIsGoogleSigningIn(false);
    }
  };
  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setIsSubmitting(true);
    setError('');

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message ?? 'Unable to create your account.');
        return;
      }

      router.replace('/dashboard');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create your account.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <main className='grid min-h-screen place-items-center bg-slate-50 p-6'>
        <LoaderCircle className='h-6 w-6 animate-spin text-indigo-600' />
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-10 sm:px-6'>
      <section className='mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 md:grid-cols-[1.05fr_0.95fr]'>
        <div className='hidden bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 p-10 text-white md:flex md:flex-col md:justify-between'>
          <div className='inline-flex w-fit items-center gap-2 text-lg font-bold'>
            <GraduationCap className='h-6 w-6' />
            SkillSphere
          </div>

          <div>
            <p className='text-sm font-semibold text-indigo-100'>
              Start learning today
            </p>

            <h1 className='mt-3 text-4xl font-bold tracking-tight'>
              Build skills that move you forward.
            </h1>

            <ul className='mt-8 space-y-4 text-sm leading-6 text-indigo-50'>
              <li className='flex gap-3'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-indigo-200' />
                Learn through structured video and article lessons
              </li>

              <li className='flex gap-3'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-indigo-200' />
                Track every completed lesson and course milestone
              </li>

              <li className='flex gap-3'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-indigo-200' />
                Continue exactly where you left off
              </li>
            </ul>
          </div>

          <p className='text-xs text-indigo-200'>
            Create a free student account in minutes.
          </p>
        </div>

        <div className='p-6 sm:p-10'>
          <div className='md:hidden'>
            <Link
              href='/'
              className='inline-flex items-center gap-2 text-lg font-bold text-indigo-700'
            >
              <GraduationCap className='h-6 w-6' />
              SkillSphere
            </Link>
          </div>

          <p className='mt-8 text-sm font-semibold text-indigo-600 md:mt-0'>
            Create account
          </p>

          <h2 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Start your learning journey
          </h2>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Your new account will be created as a student account.
          </p>

          {error && (
            <div className='mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <label className='block'>
              <span className='text-sm font-semibold text-slate-700'>
                Full name
              </span>

              <input
                type='text'
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder='Your name'
                autoComplete='name'
                minLength={2}
                required
                className='mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />
            </label>

            <label className='block'>
              <span className='text-sm font-semibold text-slate-700'>
                Email address
              </span>

              <input
                type='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder='you@example.com'
                autoComplete='email'
                required
                className='mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />
            </label>

            <label className='block'>
              <span className='text-sm font-semibold text-slate-700'>
                Password
              </span>

              <input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder='At least 8 characters'
                autoComplete='new-password'
                minLength={8}
                required
                className='mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />
            </label>

            <button
              type='submit'
              disabled={isSubmitting}
              className='mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className='h-4 w-4' />
                </>
              )}
            </button>
            {/* google */}
            <button
              type='button'
              onClick={() => void handleGoogleSignIn()}
              disabled={isGoogleSigningIn || isSubmitting}
              className='flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isGoogleSigningIn ? (
                <>
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <FcGoogle className='h-5 w-5' />
                  Continue with Google
                </>
              )}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-slate-600'>
            Already have an account?{' '}
            <Link
              href='/sign-in'
              className='font-semibold text-indigo-600 hover:text-indigo-700'
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
