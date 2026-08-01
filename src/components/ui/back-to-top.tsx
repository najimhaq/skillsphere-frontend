'use client';

import { ArrowUp } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { useEffect, useState } from 'react';

export function BackToTop() {
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type='button'
      onClick={() => {
        lenis?.scrollTo(0, {
          duration: 1.1,
        });
      }}
      className='fixed bottom-5 right-5 z-50 inline-flex size-11 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
      aria-label='Back to top'
    >
      <ArrowUp className='size-5' aria-hidden='true' />
    </button>
  );
}
