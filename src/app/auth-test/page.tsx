'use client';

import { SubmitEvent,useState } from 'react';

import { authClient } from '@/lib/auth-client';

type AuthMode = 'signup' | 'signin';

type AuthMessage = {
  type: 'success' | 'error';
  text: string;
};

export default function AuthTestPage() {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);
  const { data: session, isPending } = authClient.useSession();

  console.log(session)

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (error) {
          setMessage({
            type: 'error',
            text: error.message ?? 'Unable to create account',
          });
          return;
        }

        setMessage({
          type: 'success',
          text: 'Account created successfully. A session cookie should now exist.',
        });
      }

      if (mode === 'signin') {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setMessage({
            type: 'error',
            text: error.message ?? 'Unable to sign in',
          });
          return;
        }

        setMessage({
          type: 'success',
          text: 'Signed in successfully. A session cookie should now exist.',
        });
      }
    } catch (error: unknown) {
      const text =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setMessage({
        type: 'error',
        text,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setMessage({
          type: 'error',
          text: error.message ?? 'Unable to sign out',
        });
        return;
      }

      setMessage({
        type: 'success',
        text: 'Signed out successfully.',
      });
    } catch (error: unknown) {
      const text =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setMessage({
        type: 'error',
        text,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className='mx-auto flex min-h-screen max-w-md flex-col justify-center px-6'>
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h1 className='text-2xl font-bold text-slate-900'>
          SkillSphere Auth Test
        </h1>

        <p className='mt-2 text-sm text-slate-600'>
          Better Auth cookie-session integration test
        </p>

        <div className='mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-700'>
          {isPending ? (
            <p>Checking session...</p>
          ) : session?.user ? (
            <>
              <p className='font-semibold'>Signed in as: {session.user.name}</p>
              <p>{session.user.email}</p>
            </>
          ) : (
            <p>No active session</p>
          )}
        </div>

        <div className='mt-6 flex gap-2'>
          <button
            type='button'
            onClick={() => setMode('signup')}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              mode === 'signup'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Sign up
          </button>

          <button
            type='button'
            onClick={() => setMode('signin')}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              mode === 'signin'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Sign in
          </button>
        </div>

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          {mode === 'signup' && (
            <label className='block'>
              <span className='text-sm font-medium text-slate-700 '>Name</span>
              <input
                type='text'
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:bg-blue-200 text-black'
              />
            </label>
          )}

          <label className='block'>
            <span className='text-sm font-medium text-slate-700'>Email</span>
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:bg-blue-200 text-black'
            />
          </label>

          <label className='block'>
            <span className='text-sm font-medium text-slate-700'>Password</span>
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:bg-blue-200 text-black'
            />
          </label>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isLoading
              ? 'Processing...'
              : mode === 'signup'
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <button
          type='button'
          onClick={handleSignOut}
          disabled={isLoading}
          className='mt-3 w-full rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Sign out
        </button>

        {message && (
          <p
            className={`mt-4 rounded-md p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </main>
  );
}
