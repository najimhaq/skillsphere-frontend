'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

const dashboardPaths = ['/dashboard', '/admin', '/instructor', '/student'];

export default function ConditionalFooter() {
  const pathname = usePathname();

  const isDashboardRoute = dashboardPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isDashboardRoute) {
    return null;
  }

  return <Footer />;
}
