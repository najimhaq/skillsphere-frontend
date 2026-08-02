// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const dashboardByRole = {
  STUDENT: '/dashboard/student',
  INSTRUCTOR: '/dashboard/instructor',
  ADMIN: '/dashboard/admin',
} as const;

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace('/sign-in');
      return;
    }

    const user = session.user as { role?: keyof typeof dashboardByRole };
    const role = user.role;

    router.replace(dashboardByRole[role ?? 'STUDENT'] ?? '/dashboard/student');
  }, [isPending, router, session]);

  return (
    <div className='grid min-h-screen place-items-center'>
      Loading dashboard...
    </div>
  );
}
