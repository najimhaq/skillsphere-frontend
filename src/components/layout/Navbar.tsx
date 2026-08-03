'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { authClient } from '@/lib/auth-client';
import Image from 'next/image';

const navLinks = [
  {
    href: '/courses',
    label: 'Browse courses',
  },
  {
    href: '/#how-it-works',
    label: 'How it works',
  },
  {
    href: '/#for-instructors',
    label: 'For instructors',
  },
] as const;

const dashboardByRole = {
  STUDENT: '/dashboard/student',
  INSTRUCTOR: '/dashboard/instructor',
  ADMIN: '/dashboard/admin',
} as const;

type UserRole = keyof typeof dashboardByRole;

const isUserRole = (value: unknown): value is UserRole => {
  return value === 'STUDENT' || value === 'INSTRUCTOR' || value === 'ADMIN';
};

const getInitial = (name?: string | null) => {
  return name?.trim().charAt(0).toUpperCase() || 'U';
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const role = isUserRole(user?.role) ? user.role : 'STUDENT';
  const dashboardPath = dashboardByRole[role];

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message ?? 'Unable to sign out.');
        return;
      }

      closeMenus();
      toast.success('Signed out successfully.');
      router.replace('/');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to sign out.'
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const isCoursesActive = pathname.startsWith('/courses');

  return (
    <header className='sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link
          href='/'
          onClick={closeMenus}
          className='flex items-center gap-2 font-bold tracking-tight text-slate-950'
        >
          <span className='flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white'>
            <GraduationCap className='size-5' aria-hidden='true' />
          </span>

          <span className='text-xl'>SkillSphere</span>
        </Link>

        <nav
          className='hidden items-center gap-7 md:flex'
          aria-label='Primary navigation'
        >
          {navLinks.map((link) => {
            const isActive = link.href === '/courses' && isCoursesActive;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className='hidden items-center gap-2 sm:flex'>
          {isPending ? (
            <div className='grid size-10 place-items-center text-slate-400'>
              <LoaderCircle className='size-5 animate-spin' />
            </div>
          ) : user ? (
            <div className='relative'>
              <button
                type='button'
                onClick={() => setIsUserMenuOpen((value) => !value)}
                className='inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
                aria-expanded={isUserMenuOpen}
                aria-haspopup='menu'
              >
                <span className='grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700'>
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? 'User'}
                      priority
                      loading='eager'
                      className='h-8 w-8 rounded-full object-cover'
                      width={32}
                      height={32}
                    />
                  ) : (
                    getInitial(user.name)
                  )}
                </span>

                <span className='max-w-32 truncate'>{user.name}</span>

                <ChevronDown
                  className={`size-4 text-slate-500 transition ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div
                  className='absolute right-0 top-[calc(100%+0.6rem)] w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-200/70'
                  role='menu'
                >
                  <div className='border-b border-slate-100 px-4 py-3'>
                    <p className='truncate text-sm font-semibold text-slate-900'>
                      {user.name}
                    </p>

                    <p className='mt-0.5 truncate text-xs text-slate-500'>
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href={dashboardPath}
                    onClick={closeMenus}
                    className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                    role='menuitem'
                  >
                    <LayoutDashboard className='size-4 text-indigo-600' />
                    Dashboard
                  </Link>

                  <Link
                    href='/dashboard/student/settings'
                    onClick={closeMenus}
                    className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                    role='menuitem'
                  >
                    <UserRound className='size-4 text-slate-500' />
                    Account settings
                  </Link>

                  <div className='my-1 border-t border-slate-100' />

                  <button
                    type='button'
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className='flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60'
                    role='menuitem'
                  >
                    {isSigningOut ? (
                      <LoaderCircle className='size-4 animate-spin' />
                    ) : (
                      <LogOut className='size-4' />
                    )}

                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href='/sign-in'
                className='rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
              >
                Sign in
              </Link>

              <Link
                href='/sign-up'
                className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type='button'
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          className='inline-flex size-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:hidden'
          aria-label={
            isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className='size-5' aria-hidden='true' />
          ) : (
            <Menu className='size-5' aria-hidden='true' />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className='border-t border-slate-200 bg-white px-4 py-4 shadow-lg sm:hidden'>
          <nav
            className='mx-auto flex max-w-7xl flex-col gap-1'
            aria-label='Mobile navigation'
          >
            {navLinks.map((link) => {
              const isActive = link.href === '/courses' && isCoursesActive;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenus}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className='my-2 border-t border-slate-200' />

            {isPending ? (
              <div className='flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-500'>
                <LoaderCircle className='size-4 animate-spin' />
                Checking session...
              </div>
            ) : user ? (
              <>
                <div className='rounded-lg bg-slate-50 px-3 py-3'>
                  <p className='truncate text-sm font-bold text-slate-900'>
                    {user.name}
                  </p>

                  <p className='mt-0.5 truncate text-xs text-slate-500'>
                    {user.email}
                  </p>
                </div>

                <Link
                  href={dashboardPath}
                  onClick={closeMenus}
                  className='flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                >
                  <LayoutDashboard className='size-4 text-indigo-600' />
                  Dashboard
                </Link>

                <Link
                  href='/dashboard/student/settings'
                  onClick={closeMenus}
                  className='flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                >
                  <UserRound className='size-4 text-slate-500' />
                  Account settings
                </Link>

                <button
                  type='button'
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className='flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {isSigningOut ? (
                    <LoaderCircle className='size-4 animate-spin' />
                  ) : (
                    <LogOut className='size-4' />
                  )}

                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href='/sign-in'
                  onClick={closeMenus}
                  className='rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                >
                  Sign in
                </Link>

                <Link
                  href='/sign-up'
                  onClick={closeMenus}
                  className='rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700'
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
