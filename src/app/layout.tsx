import './globals.css';
// frontend - app/layout.js
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

import { Inter } from 'next/font/google';

export const metadata = {
  title: 'SkillSphere - Find Your Perfect course',
  description: 'Discover and book amazing courses worldwide',
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
      <body className='flex min-h-screen flex-col  antialiased'>
        <main className='grow'>
          <div className='mx-auto max-w-full'>{children}</div>
        </main>
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
