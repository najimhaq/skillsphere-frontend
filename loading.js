export default function Loading() {
  return (
    <div className='min-h-[70vh] flex items-center justify-center bg-black text-white'>
      <div className='w-full max-w-2xl mx-auto bg-zinc-950 border border-zinc-900 rounded-xl p-8 text-center space-y-4'>
        <div className='w-14 h-14 rounded-full border border-zinc-800 bg-zinc-900/50 mx-auto animate-pulse' />
        <div className='h-6 w-56 bg-zinc-800/70 rounded mx-auto animate-pulse' />
        <div className='h-4 w-80 bg-zinc-900 rounded mx-auto animate-pulse' />
        <div className='h-11 w-48 bg-zinc-800 rounded-lg mx-auto animate-pulse' />
      </div>
    </div>
  );
}
