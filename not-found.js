import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-6 text-white'>
      {/* Grid background */}
      <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]' />

      {/* Soft glow */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_55%)]' />

      {/* Card */}
      <section className='relative w-full max-w-3xl border border-white/15 bg-black/90 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm'>
        {/* Corner accents */}
        <span className='absolute -left-[1px] -top-[1px] h-8 w-8 border-l-4 border-t-4 border-white/70' />
        <span className='absolute -right-[1px] -top-[1px] h-8 w-8 border-r-4 border-t-4 border-white/70' />
        <span className='absolute -bottom-[1px] -left-[1px] h-8 w-8 border-b-4 border-l-4 border-white/70' />
        <span className='absolute -bottom-[1px] -right-[1px] h-8 w-8 border-b-4 border-r-4 border-white/70' />

        {/* Top label */}
        <div className='border-b border-white/10 px-6 py-8 text-center'>
          <div className='inline-block border border-red-400/80 px-6 py-2'>
            <h1 className='text-4xl font-bold tracking-wide text-white md:text-5xl'>
              ERROR 404
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className='px-6 py-12 text-center md:px-14'>
          <h2 className='text-3xl font-semibold md:text-4xl'>Page not found</h2>

          <div className='mt-5 inline-block border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300'>
            CODE: route_not_found
          </div>

          <p className='mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-400 md:text-base'>
            We couldn&apos;t find the page you&apos;re looking for. It may have
            been moved, removed, or the URL may be incorrect.
          </p>

          <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <Link
              href='/'
              className='inline-flex h-12 min-w-36 items-center justify-center border border-white bg-white px-6 text-sm font-medium text-black transition hover:bg-gray-200'
            >
              Go Home
            </Link>

            <Link
              href='/contact'
              className='inline-flex h-12 min-w-36 items-center justify-center border border-white/20 bg-transparent px-6 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5'
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
