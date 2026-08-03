'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Copy,
  ExternalLink,
  GraduationCap,
  LoaderCircle,
  Printer,
} from 'lucide-react';

import {
  getMyCourseCertificate,
  type Certificate,
} from '@/lib/certificate-api';

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
};

export default function CertificatePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadCertificate = async () => {
      try {
        const data = await getMyCourseCertificate(courseId);

        if (!isCancelled) {
          setCertificate(data);
          setError('');
        }
      } catch (caughtError) {
        if (!isCancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load your certificate.'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCertificate();

    return () => {
      isCancelled = true;
    };
  }, [courseId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerificationCode = async () => {
    if (!certificate) {
      return;
    }

    try {
      await navigator.clipboard.writeText(certificate.verificationCode);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  if (isLoading) {
    return (
      <div className='grid min-h-80 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading your certificate...
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className='mx-auto max-w-2xl'>
        <Link
          href='/dashboard/student/my-learning'
          className='inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to my learning
        </Link>

        <section className='mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6'>
          <div className='flex items-start gap-3 text-rose-700'>
            <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

            <div>
              <h1 className='font-bold'>Certificate unavailable</h1>

              <p className='mt-1 text-sm leading-6'>
                {error || 'Your certificate could not be found.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;

  return (
    <div className='mx-auto max-w-6xl'>
      <div className='no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <Link
          href='/dashboard/student/my-learning'
          className='inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to my learning
        </Link>

        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={handleCopyVerificationCode}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
          >
            {copied ? (
              <CheckCircle2 className='h-4 w-4 text-emerald-600' />
            ) : (
              <Copy className='h-4 w-4' />
            )}
            {copied ? 'Verification code copied' : 'Copy verification code'}
          </button>

          <button
            type='button'
            onClick={handlePrint}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700'
          >
            <Printer className='h-4 w-4' />
            Print / Save as PDF
          </button>
        </div>
      </div>

      <section className='print-certificate mt-6 overflow-hidden rounded-3xl border-10px border-indigo-100 bg-white p-3 shadow-lg sm:p-5'>
        <div className='relative overflow-hidden rounded-2xl border-2 border-indigo-700 px-6 py-12 text-center sm:px-12 sm:py-16'>
          <div className='absolute left-0 top-0 h-32 w-32 rounded-br-full bg-indigo-50' />
          <div className='absolute bottom-0 right-0 h-40 w-40 rounded-tl-full bg-violet-50' />

          <div className='relative'>
            <div className='mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-700 text-white shadow-lg'>
              <GraduationCap className='h-9 w-9' />
            </div>

            <p className='mt-6 text-sm font-bold tracking-[0.2em] text-indigo-700 uppercase'>
              SkillSphere
            </p>

            <div className='mx-auto mt-3 h-px w-24 bg-indigo-200' />

            <p className='mt-8 text-sm font-semibold tracking-[0.16em] text-slate-500 uppercase'>
              Certificate of Completion
            </p>

            <p className='mt-6 text-base text-slate-600'>
              This is proudly presented to
            </p>

            <h1 className='mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl'>
              {certificate.studentName}
            </h1>

            <div className='mx-auto mt-5 h-px w-56 bg-slate-300' />

            <p className='mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base'>
              For successfully completing the course
            </p>

            <h2 className='mx-auto mt-3 max-w-3xl text-xl font-bold text-indigo-700 sm:text-3xl'>
              {certificate.courseTitle}
            </h2>

            <div className='mx-auto mt-10 grid max-w-xl gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2'>
              <div>
                <p className='text-xs font-bold tracking-wide text-slate-500 uppercase'>
                  Issued on
                </p>

                <p className='mt-1 text-sm font-semibold text-slate-800'>
                  {formatDate(certificate.issuedAt)}
                </p>
              </div>

              <div>
                <p className='text-xs font-bold tracking-wide text-slate-500 uppercase'>
                  Certificate number
                </p>

                <p className='mt-1 font-mono text-sm font-bold text-slate-800'>
                  {certificate.certificateNumber}
                </p>
              </div>
            </div>

            <div className='mx-auto mt-8 max-w-md rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3'>
              <p className='text-xs font-bold tracking-wide text-indigo-700 uppercase'>
                Verification code
              </p>

              <p className='mt-1 font-mono text-sm font-bold tracking-wider text-indigo-950'>
                {certificate.verificationCode}
              </p>
            </div>

            <a
              href={verificationUrl}
              target='_blank'
              rel='noreferrer'
              className='no-print mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700'
            >
              Open public verification link
              <ExternalLink className='h-3.5 w-3.5' />
            </a>

            <div className='mt-10 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500'>
              <Award className='h-4 w-4 text-amber-500' />
              Verified SkillSphere achievement
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
