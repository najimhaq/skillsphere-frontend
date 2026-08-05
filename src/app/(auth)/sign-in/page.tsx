'use client';

import { useEffect, useState, type SubmitEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import { authClient } from '@/lib/auth-client';

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

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
      const { error: signInError } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message ?? 'Invalid email or password.');
        return;
      }

      router.replace('/dashboard');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to sign in.'
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
    <main className='grid min-h-screen place-items-center bg-slate-50 px-4 py-10 sm:px-6'>
      <section className='w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-lg font-bold text-indigo-700'
        >
          <GraduationCap className='h-6 w-6' />
          SkillSphere
        </Link>

        <div className='mt-8'>
          <div className='grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-700'>
            <LockKeyhole className='h-6 w-6' />
          </div>

          <p className='mt-5 text-sm font-semibold text-indigo-600'>
            Welcome back
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Sign in to SkillSphere
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Continue your learning exactly where you left off.
          </p>
        </div>

        {error && (
          <div className='mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
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
              placeholder='Your password'
              autoComplete='current-password'
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
                Signing in...
              </>
            ) : (
              <>
                Sign in
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
          New to SkillSphere?{' '}
          <Link
            href='/signup'
            className='font-semibold text-indigo-600 hover:text-indigo-700'
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
