'use client';

import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { enrollInCourse } from '@/lib/enrollment-api';

type EnrollButtonProps = {
  courseId: string;
};

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleEnroll = async () => {
    setIsLoading(true);

    try {
      await enrollInCourse(courseId);

      setIsEnrolled(true);

      toast.success('You are enrolled! Your learning journey starts now.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not enroll in this course';

      if (message === 'Authentication required') {
        toast.error('Please sign in before enrolling.');
        return;
      }

      if (message === 'You are already enrolled in this course') {
        setIsEnrolled(true);
        toast.success('You are already enrolled in this course.');
        return;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type='button'
      onClick={handleEnroll}
      disabled={isLoading || isEnrolled}
      className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-emerald-600 disabled:hover:bg-emerald-600'
    >
      {isLoading ? (
        <>
          <LoaderCircle className='size-5 animate-spin' aria-hidden='true' />
          Enrolling...
        </>
      ) : isEnrolled ? (
        'Enrolled'
      ) : (
        'Enroll now'
      )}
    </button>
  );
}
