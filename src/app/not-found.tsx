'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Coffee,
  Compass,
  Home,
  MessageCircle,
  Moon,
  Rocket,
  Search,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';

const particles = [
  { top: '10%', left: '12%', size: 'h-2 w-2', delay: '0s', duration: '7s' },
  { top: '18%', left: '82%', size: 'h-3 w-3', delay: '1s', duration: '9s' },
  { top: '38%', left: '8%', size: 'h-2 w-2', delay: '2s', duration: '8s' },
  { top: '62%', left: '88%', size: 'h-2 w-2', delay: '0.5s', duration: '6s' },
  { top: '82%', left: '18%', size: 'h-3 w-3', delay: '1.5s', duration: '10s' },
  { top: '78%', left: '72%', size: 'h-2 w-2', delay: '3s', duration: '7s' },
];

const quickLinks = [
  {
    label: 'Browse Courses',
    href: '/courses',
    icon: BookOpen,
    className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
  },
  {
    label: 'Join Community',
    href: '/community',
    icon: Users,
    className: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
  },
  {
    label: 'Get Support',
    href: '/support',
    icon: MessageCircle,
    className: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
  },
];

const tips = [
  'Check the URL for typos',
  'Go back to the previous page',
  'Visit our homepage',
  'Search for what you need',
  'Contact support for help',
];

export default function NotFound() {
  const router = useRouter();

  const [isDark, setIsDark] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth - 0.5) * 20,
        y: (event.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      router.push('/courses');
      return;
    }

    router.push(`/courses?search=${encodeURIComponent(query)}`);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  };

  const pageClassName = isDark
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white'
    : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-slate-900';

  const cardClassName = isDark
    ? 'border-slate-700/70 bg-slate-900/60'
    : 'border-slate-200/60 bg-white/60';

  const mutedTextClassName = isDark ? 'text-slate-300' : 'text-slate-500';

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${pageClassName}`}
    >
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl' />
        <div className='absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300/10 blur-3xl' />

        {particles.map((particle, index) => (
          <span
            key={index}
            className={`absolute rounded-full bg-indigo-400/40 ${particle.size}`}
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <button
        type='button'
        onClick={() => setIsDark((current) => !current)}
        aria-label={isDark ? 'Enable light mode' : 'Enable dark mode'}
        className={`fixed top-6 right-6 z-50 rounded-full border p-2.5 shadow-lg backdrop-blur-sm transition hover:scale-110 ${
          isDark
            ? 'border-slate-700 bg-slate-800/90 text-amber-400'
            : 'border-slate-200/60 bg-white/80 text-indigo-600'
        }`}
      >
        {isDark ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
      </button>

      <main className='relative z-10 flex min-h-screen items-center justify-center px-4 py-12'>
        <div className='w-full max-w-4xl'>
          <div
            className='relative text-center transition-transform duration-100'
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${
                mousePosition.y * 0.3
              }px)`,
            }}
          >
            <div className='relative inline-block'>
              <div className='absolute inset-0 rounded-full bg-linear-to-r from-indigo-400/30 to-purple-400/30 blur-3xl' />

              <h1
                className={`relative text-[12vw] font-black leading-none tracking-tight md:text-[10vw] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                404
              </h1>
            </div>

            <Sparkles className='absolute top-1/2 -left-4 h-10 w-10 -translate-y-1/2 text-indigo-400/30 sm:-left-10 sm:h-12 sm:w-12' />
            <Compass className='absolute top-1/2 -right-4 h-10 w-10 -translate-y-1/2 text-purple-400/30 sm:-right-10 sm:h-12 sm:w-12' />
          </div>

          <div
            className='mt-6 text-center transition-transform duration-100'
            style={{
              transform: `translate(${mousePosition.x * 0.1}px, ${
                mousePosition.y * 0.1
              }px)`,
            }}
          >
            <div className='inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-300'>
              <Rocket className='h-4 w-4' />
              Oops! Page not found
            </div>

            <h2
              className={`mt-6 text-3xl font-bold sm:text-4xl ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}
            >
              Looks like you&apos;re lost
            </h2>

            <p
              className={`mx-auto mt-3 max-w-md text-base sm:text-lg ${mutedTextClassName}`}
            >
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Don&apos;t worry, we&apos;ll help you find your way back.
            </p>
          </div>

          <form onSubmit={handleSearch} className='mx-auto mt-8 max-w-md'>
            <div
              className={`flex items-center rounded-xl border shadow-lg backdrop-blur-sm ${cardClassName}`}
            >
              <Search className='ml-4 h-5 w-5 shrink-0 text-slate-400' />

              <input
                type='search'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder='Search for courses, topics, or help...'
                className={`w-full bg-transparent py-3.5 px-3 text-sm outline-none ${
                  isDark
                    ? 'text-white placeholder:text-slate-400'
                    : 'text-slate-900 placeholder:text-slate-400'
                }`}
              />

              <button
                type='submit'
                className='mr-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700'
              >
                Search
              </button>
            </div>
          </form>

          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
            <Link
              href='/'
              className='group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200/50 transition hover:scale-105'
            >
              <Home className='h-4 w-4 transition-transform group-hover:-translate-y-0.5' />
              Back to Home
            </Link>

            <button
              type='button'
              onClick={handleGoBack}
              className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium shadow-lg backdrop-blur-sm transition hover:scale-105 ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200/60 bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              <ArrowLeft className='h-4 w-4' />
              Go Back
            </button>
          </div>

          <div className='mt-12 grid gap-3 sm:grid-cols-3'>
            {quickLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`group rounded-xl border p-4 text-center backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg ${cardClassName} ${link.className}`}
                >
                  <Icon className='mx-auto h-6 w-6 transition-transform group-hover:scale-110' />
                  <p className='mt-2 text-sm font-medium'>{link.label}</p>
                </Link>
              );
            })}
          </div>

          <section
            className={`mt-8 rounded-xl border p-6 backdrop-blur-sm ${cardClassName}`}
          >
            <div className='flex items-start gap-3'>
              <Coffee className='mt-0.5 h-5 w-5 shrink-0 text-indigo-500' />

              <div>
                <h3
                  className={`text-sm font-semibold ${
                    isDark ? 'text-slate-100' : 'text-slate-700'
                  }`}
                >
                  💡 Quick Tips
                </h3>

                <ul className='mt-3 flex flex-wrap gap-2'>
                  {tips.map((tip) => (
                    <li
                      key={tip}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-indigo-900 hover:text-indigo-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'
                      }`}
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <p
            className={`mt-6 text-center text-sm transition ${
              isHovering
                ? 'text-indigo-500'
                : isDark
                  ? 'text-slate-500'
                  : 'text-slate-400'
            }`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {isHovering
              ? '✨ You found the secret message!'
              : '🔮 Not all who wander are lost'}
          </p>
        </div>
      </main>

      <style jsx>{`
        span {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-20px) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
