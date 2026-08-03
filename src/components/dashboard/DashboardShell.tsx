'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogOut, UserCircle2 } from 'lucide-react';
import Image from 'next/image';

import { authClient } from '@/lib/auth-client';
import { dashboardMenus, type UserRole } from '@/config/dashboard-menu';

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const role = (session?.user as { role?: UserRole } | undefined)?.role;
  const menuItems = role ? (dashboardMenus[role] ?? []) : [];

  const handleSignOut = async (): Promise<void> => {
    await authClient.signOut();
    router.replace('/sign-in');
    router.refresh();
  };

  if (isPending) {
    return (
      <div className='grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500'>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <aside className='fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex'>
        <div className='flex items-center gap-3 border-b border-slate-100 px-6 py-5'>
          <div className='grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white'>
            S
          </div>

          <div>
            <h1 className='font-bold tracking-tight text-slate-900'>
              SkillSphere
            </h1>

            <p className='text-xs text-slate-500'>Dashboard</p>
          </div>
        </div>

        <nav className='flex-1 space-y-1 p-4'>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCreateCourse = item.href.endsWith('/courses/create');

            const isActive = isCreateCourse
              ? pathname === item.href
              : pathname === item.href ||
                (item.href !== `/dashboard/${role?.toLowerCase()}` &&
                  pathname.startsWith(`${item.href}/`) &&
                  !pathname.endsWith('/create'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Icon className='h-4 w-4' />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className='border-t border-slate-200 p-4'>
          <div className='mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3'>
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'User'}
                width={36}
                height={36}
                className='h-9 w-9 shrink-0 rounded-full object-cover'
              />
            ) : (
              <UserCircle2 className='h-9 w-9 shrink-0 text-slate-400' />
            )}

            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-slate-800'>
                {session?.user?.name ?? 'User'}
              </p>

              <p className='truncate text-xs text-slate-500'>
                {session?.user?.email ?? ''}
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleSignOut}
            className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50'
          >
            <LogOut className='h-4 w-4' />
            Sign out
          </button>
        </div>
      </aside>

      <main className='min-h-screen p-6 lg:ml-64 lg:p-10'>{children}</main>
    </div>
  );
}
