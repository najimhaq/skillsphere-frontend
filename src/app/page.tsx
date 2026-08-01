import Link from 'next/link';
import { Reveal } from '@/components/ui/reveal';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const benefits = [
  {
    title: 'Learn by building',
    description:
      'Follow structured courses designed around practical, job-ready skills.',
    icon: BookOpen,
  },
  {
    title: 'Track your growth',
    description:
      'Stay focused with clear learning paths and visible course progress.',
    icon: LayoutDashboard,
  },
  {
    title: 'Learn from experts',
    description:
      'Explore courses created by instructors who teach from real experience.',
    icon: UsersRound,
  },
] as const;

const outcomes = [
  'Practical courses for modern digital skills',
  'A focused learning path at your own pace',
  'Progress tracking from first lesson to completion',
] as const;

export default function HomePage() {
  return (
    <main>
      <section className='relative overflow-hidden bg-slate-950'>
        <div
          className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.32),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_35%)]'
          aria-hidden='true'
        />

        <div className='relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8'>
          <div>
            <div className='inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-indigo-400/10 px-3 py-1.5 text-sm font-medium text-indigo-100'>
              <Sparkles className='size-4' aria-hidden='true' />
              Learn skills that move you forward
            </div>

            <h1 className='mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>
              Build real skills.
              <span className='block text-indigo-300'>Create your future.</span>
            </h1>

            <p className='mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg'>
              SkillSphere is a focused learning platform for practical courses,
              structured progress, and the confidence to turn what you learn
              into what you can do.
            </p>

            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <Link
                href='/courses'
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400'
              >
                Explore courses
                <ArrowRight className='size-4' aria-hidden='true' />
              </Link>

              <a
                href='#how-it-works'
                className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-white/5'
              >
                <CirclePlay className='size-4' aria-hidden='true' />
                See how it works
              </a>
            </div>

            <div className='mt-10 grid gap-3 text-sm text-slate-300 sm:grid-cols-3'>
              <p>
                <span className='block text-2xl font-bold text-white'>1+</span>
                Expert-led courses
              </p>
              <p>
                <span className='block text-2xl font-bold text-white'>3</span>
                Learning roles
              </p>
              <p>
                <span className='block text-2xl font-bold text-white'>
                  100%
                </span>
                Build at your pace
              </p>
            </div>
          </div>

          <div className='relative mx-auto w-full max-w-lg'>
            <div className='rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-sm'>
              <div className='rounded-2xl bg-slate-900 p-5'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex size-11 items-center justify-center rounded-xl bg-indigo-500 text-white'>
                      <GraduationCap className='size-6' aria-hidden='true' />
                    </div>

                    <div>
                      <p className='font-semibold text-white'>
                        Your learning path
                      </p>
                      <p className='text-sm text-slate-400'>
                        Keep making progress
                      </p>
                    </div>
                  </div>

                  <span className='rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300'>
                    Active
                  </span>
                </div>

                <div className='mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300'>
                      <BookOpen className='size-5' aria-hidden='true' />
                    </div>

                    <div className='min-w-0'>
                      <p className='font-semibold text-white'>
                        Modern TypeScript for Full Stack Developers
                      </p>
                      <p className='mt-1 text-sm text-slate-400'>
                        Web Development · Intermediate
                      </p>
                    </div>
                  </div>

                  <div className='mt-5'>
                    <div className='flex justify-between text-xs font-medium text-slate-400'>
                      <span>Course progress</span>
                      <span>32%</span>
                    </div>

                    <div className='mt-2 h-2 overflow-hidden rounded-full bg-slate-800'>
                      <div className='h-full w-[32%] rounded-full bg-indigo-500' />
                    </div>
                  </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-3'>
                  <div className='rounded-xl border border-slate-800 bg-slate-950 p-4'>
                    <p className='text-sm text-slate-400'>Learning streak</p>
                    <p className='mt-1 text-2xl font-bold text-white'>7 days</p>
                  </div>

                  <div className='rounded-xl border border-slate-800 bg-slate-950 p-4'>
                    <p className='text-sm text-slate-400'>Courses enrolled</p>
                    <p className='mt-1 text-2xl font-bold text-white'>1</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className='absolute -bottom-5 -left-5 -z-10 size-40 rounded-full bg-indigo-500/30 blur-3xl'
              aria-hidden='true'
            />
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
        <div className='max-w-2xl'>
          <p className='text-sm font-bold uppercase tracking-[0.18em] text-indigo-600'>
            A better way to learn
          </p>

          <h2 className='mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl'>
            Learning should feel clear, practical, and motivating.
          </h2>

          <p className='mt-4 leading-7 text-slate-600'>
            SkillSphere helps you move from curiosity to capability with
            structured courses and a learning experience built for consistency.
          </p>
        </div>

        <div className='mt-10 grid gap-5 md:grid-cols-3'>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <Reveal key={benefit.title} delay={index * 0.08}>
                <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                  <div className='flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600'>
                    <Icon className='size-5' aria-hidden='true' />
                  </div>

                  <h3 className='mt-5 text-lg font-bold text-slate-950'>
                    {benefit.title}
                  </h3>

                  <p className='mt-2 leading-7 text-slate-600'>
                    {benefit.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id='how-it-works' className='border-y border-slate-200 bg-white'>
        <div className='mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8'>
          <div>
            <p className='text-sm font-bold uppercase tracking-[0.18em] text-indigo-600'>
              How it works
            </p>

            <h2 className='mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl'>
              Pick a course. Build momentum. Finish stronger.
            </h2>

            <div className='mt-7 space-y-4'>
              {outcomes.map((outcome) => (
                <div key={outcome} className='flex gap-3'>
                  <CheckCircle2
                    className='mt-0.5 size-5 shrink-0 text-emerald-500'
                    aria-hidden='true'
                  />
                  <p className='text-slate-700'>{outcome}</p>
                </div>
              ))}
            </div>

            <Link
              href='/courses'
              className='mt-8 inline-flex items-center gap-2 font-semibold text-indigo-600 transition hover:text-indigo-800'
            >
              Browse the course catalog
              <ArrowRight className='size-4' aria-hidden='true' />
            </Link>
          </div>

          <div className='rounded-3xl bg-indigo-600 p-8 text-white sm:p-10'>
            <p className='text-sm font-semibold text-indigo-200'>
              Ready when you are
            </p>

            <h3 className='mt-3 text-3xl font-bold tracking-tight'>
              Start learning with purpose.
            </h3>

            <p className='mt-4 leading-7 text-indigo-100'>
              Join SkillSphere, choose a course that fits your goal, and build a
              consistent practice that turns learning into progress.
            </p>

            <Link
              href='/auth/sign-up'
              className='mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50'
            >
              Create your free account
              <ArrowRight className='size-4' aria-hidden='true' />
            </Link>
          </div>
        </div>
      </section>

      <section
        id='for-instructors'
        className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'
      >
        <div className='rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-12'>
          <p className='text-sm font-bold uppercase tracking-[0.18em] text-indigo-300'>
            For instructors
          </p>

          <h2 className='mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl'>
            Teach what you know. Help learners grow.
          </h2>

          <p className='mx-auto mt-4 max-w-2xl leading-7 text-slate-300'>
            Create practical courses, share your knowledge, and build a learning
            experience that makes a difference.
          </p>

          <Link
            href='/auth/sign-up'
            className='mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400'
          >
            Become an instructor
            <ArrowRight className='size-4' aria-hidden='true' />
          </Link>
        </div>
      </section>
    </main>
  );
}
