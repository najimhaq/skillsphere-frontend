import './globals.css';
// frontend - app/layout.js
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import { ScrollReset } from '@/components/ui/scroll-reset';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { BackToTop } from '@/components/ui/back-to-top';

export const metadata: Metadata = {
  title: {
    default: 'SkillSphere | Learn practical skills',
    template: '%s | SkillSphere',
  },
  description:
    'SkillSphere is a learning platform for practical courses, visible progress, and career-ready skills.',
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      data-scroll-behavior='smooth'
      suppressHydrationWarning
      className={inter.className}
    >
      <body className='flex min-h-screen flex-col antialiased'>
        <SmoothScrollProvider>
          <ScrollReset />
          <ScrollProgress />

          <Navbar />

          <main className='grow'>
            <div className='mx-auto max-w-full'>{children}</div>
          </main>

          <BackToTop />
        </SmoothScrollProvider>

        <Toaster
          position='top-right'
          toastOptions={{
            style: {
              background: '#171717',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </body>
    </html>
  );
}
