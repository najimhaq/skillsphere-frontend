'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

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

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className='sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link
          href='/'
          onClick={closeMenu}
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
            const isActive =
              link.href === '/courses' && pathname.startsWith('/courses');

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
          <Link
            href='/auth/sign-in'
            className='rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
          >
            Sign in
          </Link>

          <Link
            href='/auth/sign-up'
            className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
          >
            Get started
          </Link>
        </div>

        <button
          type='button'
          onClick={() => {
            setIsMenuOpen((currentValue) => !currentValue);
          }}
          className='inline-flex size-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden'
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

      {isMenuOpen ? (
        <div className='border-t border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden'>
          <nav
            className='mx-auto flex max-w-7xl flex-col gap-1'
            aria-label='Mobile navigation'
          >
            {navLinks.map((link) => {
              const isActive =
                link.href === '/courses' && pathname.startsWith('/courses');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
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

            <Link
              href='/auth/sign-in'
              onClick={closeMenu}
              className='rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
            >
              Sign in
            </Link>

            <Link
              href='/auth/sign-up'
              onClick={closeMenu}
              className='rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700'
            >
              Get started
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
