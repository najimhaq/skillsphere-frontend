'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

import DashboardShell from '@/components/dashboard/DashboardShell';
import { authClient } from '@/lib/auth-client';

const dashboardByRole = {
  STUDENT: '/dashboard/student',
  INSTRUCTOR: '/dashboard/instructor',
  ADMIN: '/dashboard/admin',
} as const;

type UserRole = keyof typeof dashboardByRole;

const isUserRole = (value: unknown): value is UserRole => {
  return value === 'STUDENT' || value === 'INSTRUCTOR' || value === 'ADMIN';
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const role = session?.user?.role;
  const userRole = isUserRole(role) ? role : 'STUDENT';
  const expectedDashboardPath = dashboardByRole[userRole];

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!session?.user) {
      router.replace('/sign-in');
      return;
    }

    const isRootDashboard = pathname === '/dashboard';
    const isCorrectDashboard = pathname.startsWith(expectedDashboardPath);

    if (isRootDashboard || !isCorrectDashboard) {
      router.replace(expectedDashboardPath);
    }
  }, [expectedDashboardPath, isPending, pathname, router, session?.user]);

  if (isPending || !session?.user) {
    return (
      <main className='grid min-h-screen place-items-center bg-slate-50 p-6'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Checking your session...
        </div>
      </main>
    );
  }

  const isCorrectDashboard =
    pathname === '/dashboard' || pathname.startsWith(expectedDashboardPath);

  if (!isCorrectDashboard) {
    return (
      <main className='grid min-h-screen place-items-center bg-slate-50 p-6'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Redirecting to your dashboard...
        </div>
      </main>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
