'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  LogIn,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { authClient } from '@/lib/auth-client';
import { enrollInCourse } from '@/lib/student-enrollment-api';
import { createStripeCheckout } from '@/lib/payment-api';

type EnrollButtonProps = {
  courseId: string;
  price: number;
};

export function EnrollButton({ courseId, price }: EnrollButtonProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [isProcessing, setIsProcessing] = useState(false);

  const isFreeCourse = price === 0;

  const handleAction = async () => {
    if (isPending || isProcessing) {
      return;
    }

    if (!session?.user) {
      const redirectUrl = encodeURIComponent(window.location.pathname);

      router.push(`/sign-in?redirect=${redirectUrl}`);
      return;
    }

    if (session.user.role !== 'STUDENT') {
      toast.error('Only student accounts can enroll in or purchase courses.');
      return;
    }

    setIsProcessing(true);

    try {
      if (isFreeCourse) {
        await enrollInCourse(courseId);

        toast.success('You are enrolled successfully.');

        router.push('/dashboard/student/my-learning');
        router.refresh();
        return;
      }

      const { checkoutUrl } = await createStripeCheckout(courseId);

      window.location.assign(checkoutUrl);
    } catch (caughtError) {
      const error = caughtError as Error & {
        status?: number;
      };

      if (error.status === 401) {
        const redirectUrl = encodeURIComponent(window.location.pathname);

        router.push(`/sign-in?redirect=${redirectUrl}`);
        return;
      }

      if (error.status === 409) {
        toast.success('You are already enrolled in this course.');

        router.push('/dashboard/student/my-learning');
        router.refresh();
        return;
      }

      toast.error(
        error.message ||
          (isFreeCourse
            ? 'Unable to enroll in this course.'
            : 'Unable to start checkout.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const buttonLabel = !session?.user
    ? isFreeCourse
      ? 'Sign in to enroll'
      : 'Sign in to buy'
    : isFreeCourse
      ? 'Enroll for free'
      : `Buy now — $${price.toFixed(2)}`;

  return (
    <button
      type='button'
      onClick={() => void handleAction()}
      disabled={isPending || isProcessing}
      className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
    >
      {isPending || isProcessing ? (
        <>
          <LoaderCircle className='h-4 w-4 animate-spin' />
          {isFreeCourse ? 'Enrolling...' : 'Opening secure checkout...'}
        </>
      ) : !session?.user ? (
        <>
          <LogIn className='h-4 w-4' />
          {buttonLabel}
        </>
      ) : isFreeCourse ? (
        <>
          <CheckCircle2 className='h-4 w-4' />
          {buttonLabel}
        </>
      ) : (
        <>
          <CircleDollarSign className='h-4 w-4' />
          {buttonLabel}
        </>
      )}
    </button>
  );
}
