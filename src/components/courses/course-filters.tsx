import { Search } from 'lucide-react';

type CourseFiltersProps = {
  search?: string;
  category?: string;
  level?: string;
};

const categories = [
  'Web Development',
  'Programming',
  'Design',
  'Tools',
  'Business',
] as const;

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export function CourseFilters({
  search = '',
  category = '',
  level = '',
}: CourseFiltersProps) {
  return (
    <form
      action='/courses'
      className='grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_190px_180px_auto]'
    >
      <label className='relative block'>
        <span className='sr-only'>Search courses</span>

        <Search
          className='pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400'
          aria-hidden='true'
        />

        <input
          type='search'
          name='search'
          defaultValue={search}
          placeholder='Search courses...'
          className='h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
        />
      </label>

      <label>
        <span className='sr-only'>Filter by category</span>

        <select
          name='category'
          defaultValue={category}
          className='h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
        >
          <option value=''>All categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className='sr-only'>Filter by level</span>

        <select
          name='level'
          defaultValue={level}
          className='h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
        >
          <option value=''>All levels</option>

          {levels.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0) + item.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </label>

      <button
        type='submit'
        className='h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
      >
        Search
      </button>
    </form>
  );
}
