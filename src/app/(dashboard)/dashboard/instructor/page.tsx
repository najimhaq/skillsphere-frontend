import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  CirclePlus,
  GraduationCap,
  Users,
} from 'lucide-react';

const stats = [
  {
    label: 'Total Courses',
    value: '0',
    description: 'Courses you have created',
    icon: BookOpen,
    iconClassName: 'bg-indigo-50 text-indigo-600',
  },
  {
    label: 'Total Students',
    value: '0',
    description: 'Across all your courses',
    icon: Users,
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Total Enrollments',
    value: '0',
    description: 'Student enrollments',
    icon: GraduationCap,
    iconClassName: 'bg-violet-50 text-violet-600',
  },
];

export default function InstructorDashboardPage() {
  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-medium text-indigo-600'>
            Instructor workspace
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Welcome back!
          </h1>

          <p className='mt-2 max-w-xl text-sm leading-6 text-slate-600'>
            Create engaging courses, manage your content, and track student
            enrollment from one place.
          </p>
        </div>

        <Link
          href='/dashboard/instructor/courses/create'
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
        >
          <CirclePlus className='h-4 w-4' />
          Create a course
        </Link>
      </section>

      <section className='mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
            >
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-sm font-medium text-slate-600'>
                    {stat.label}
                  </p>

                  <p className='mt-3 text-3xl font-bold tracking-tight text-slate-900'>
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ${stat.iconClassName}`}
                >
                  <Icon className='h-5 w-5' />
                </div>
              </div>

              <p className='mt-4 text-sm text-slate-500'>{stat.description}</p>
            </article>
          );
        })}
      </section>

      <section className='mt-8 grid gap-6 xl:grid-cols-[1.55fr_1fr]'>
        <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h2 className='text-lg font-bold text-slate-900'>Your courses</h2>

              <p className='mt-1 text-sm text-slate-500'>
                Manage your published and draft courses.
              </p>
            </div>

            <Link
              href='/dashboard/instructor/courses'
              className='inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700'
            >
              View all
              <ArrowUpRight className='h-4 w-4' />
            </Link>
          </div>

          <div className='mt-6 grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center'>
            <div>
              <div className='mx-auto grid h-12 w-12 place-items-center rounded-full bg-indigo-100 text-indigo-600'>
                <BookOpen className='h-6 w-6' />
              </div>

              <h3 className='mt-4 font-semibold text-slate-900'>
                No courses yet
              </h3>

              <p className='mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500'>
                Your courses will appear here after you create your first
                course.
              </p>

              <Link
                href='/dashboard/instructor/courses/create'
                className='mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700'
              >
                <CirclePlus className='h-4 w-4' />
                Create your first course
              </Link>
            </div>
          </div>
        </article>

        <aside className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-slate-900'>Quick actions</h2>

          <p className='mt-1 text-sm text-slate-500'>
            Common instructor tasks.
          </p>

          <div className='mt-5 space-y-3'>
            <Link
              href='/dashboard/instructor/courses/create'
              className='flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50'
            >
              <div className='grid h-10 w-10 place-items-center rounded-lg bg-indigo-100 text-indigo-600'>
                <CirclePlus className='h-5 w-5' />
              </div>

              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  Create a course
                </p>
                <p className='mt-0.5 text-xs text-slate-500'>
                  Add new learning content
                </p>
              </div>
            </Link>

            <Link
              href='/dashboard/instructor/courses'
              className='flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50'
            >
              <div className='grid h-10 w-10 place-items-center rounded-lg bg-violet-100 text-violet-600'>
                <BookOpen className='h-5 w-5' />
              </div>

              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  Manage courses
                </p>
                <p className='mt-0.5 text-xs text-slate-500'>
                  Update course information
                </p>
              </div>
            </Link>

            <Link
              href='/dashboard/instructor/students'
              className='flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50'
            >
              <div className='grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600'>
                <Users className='h-5 w-5' />
              </div>

              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  View students
                </p>
                <p className='mt-0.5 text-xs text-slate-500'>
                  See enrolled learners
                </p>
              </div>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
