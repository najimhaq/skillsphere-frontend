// components/CategorySelect.tsx
const categories = [
  'Web Development',
  'App Development',
  'Programming',
  'Design',
  'Tools',
  'Business',
] as const;

type Category = (typeof categories)[number];

interface CategorySelectProps {
  value: Category | string;
  onChange: (value: Category) => void;
  disabled?: boolean;
  error?: string;
}

export default function CategorySelect({
  value,
  onChange,
  disabled,
  error,
}: CategorySelectProps) {
  return (
    <div className='space-y-1.5'>
      <label className='text-sm font-semibold text-slate-700'>
        Category <span className='text-rose-500'>*</span>
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Category)}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-500 ${
          error
            ? 'border-rose-300 focus:ring-rose-200'
            : 'border-slate-300 focus:ring-indigo-200'
        } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60`}
      >
        <option value='' disabled>
          Select a category
        </option>

        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {error && <p className='text-xs text-rose-600'>{error}</p>}
    </div>
  );
}


/* <div className='grid gap-6 sm:grid-cols-2'>
          <CategorySelect
            value={form.category}
            onChange={(val) => updateField('category', val)}
            disabled={isSubmitting}
            error={errors.category}
          /> */

          /* import CategorySelect from '@/components/dashboard/CategorySelect';

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
type Level = (typeof levels)[number];
type Category = string; */
