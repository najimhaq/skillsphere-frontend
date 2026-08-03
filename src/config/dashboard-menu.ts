import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  CirclePlus,
  GraduationCap,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  User
} from 'lucide-react';

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export type DashboardMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const dashboardMenus: Record<UserRole, DashboardMenuItem[]> = {
  STUDENT: [
    {
      label: 'Overview',
      href: '/dashboard/student',
      icon: LayoutDashboard,
    },
    {
      label: 'My Learning',
      href: '/dashboard/student/my-learning',
      icon: GraduationCap,
    },
    {
      label: 'Browse Courses',
      href: '/courses',
      icon: Search,
    },
    {
      label: 'Profile',
      href: '/dashboard/student/profile',
      icon: User,
    },
    {
      label: 'Settings',
      href: '/dashboard/student/settings',
      icon: Settings,
    },
  ],

  INSTRUCTOR: [
    {
      label: 'Overview',
      href: '/dashboard/instructor',
      icon: LayoutDashboard,
    },
    {
      label: 'My Courses',
      href: '/dashboard/instructor/courses',
      icon: BookOpen,
    },
    {
      label: 'Create Course',
      href: '/dashboard/instructor/courses/create',
      icon: CirclePlus,
    },
    {
      label: 'Students',
      href: '/dashboard/instructor/students',
      icon: Users,
    },
    {
      label: 'Profile',
      href: '/dashboard/instructor/profile',
      icon: User,
    },
    {
      label: 'Settings',
      href: '/dashboard/instructor/settings',
      icon: Settings,
    },
  ],

  ADMIN: [
    {
      label: 'Overview',
      href: '/dashboard/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Users',
      href: '/dashboard/admin/users',
      icon: Users,
    },
    {
      label: 'Courses',
      href: '/dashboard/admin/courses',
      icon: BookOpen,
    },
    {
      label: 'Analytics',
      href: '/dashboard/admin/analytics',
      icon: BarChart3,
    },
    {
      label: 'Settings',
      href: '/dashboard/admin/settings',
      icon: Settings,
    },
  ],
};
