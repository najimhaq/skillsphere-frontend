'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  BookCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileWarning,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type ActivityAction =
  | 'COURSE_PUBLISHED'
  | 'COURSE_REJECTED'
  | 'COURSE_CHANGES_REQUESTED'
  | 'USER_ROLE_CHANGED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED';

type ActivityTargetType = 'COURSE' | 'USER';

type ActivityLog = {
  _id: string;
  actor: {
    _id: string;
    name: string;
    email: string;
  };
  action: ActivityAction;
  target: {
    type: ActivityTargetType;
    _id: string;
    name: string;
    email: string | null;
  };
  previousValue: Record<string, unknown> | null;
  nextValue: Record<string, unknown> | null;
  note: string | null;
  createdAt: string;
};

type ActivityLogsResponse = {
  success: true;
  data: ActivityLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type FailedResponse = {
  success: false;
  message?: string;
};

type ActionFilter = 'ALL' | ActivityAction;

const actionOptions: Array<{
  value: ActionFilter;
  label: string;
}> = [
  { value: 'ALL', label: 'All activities' },
  { value: 'COURSE_PUBLISHED', label: 'Course published' },
  { value: 'COURSE_REJECTED', label: 'Course rejected' },
  { value: 'COURSE_CHANGES_REQUESTED', label: 'Changes requested' },
  { value: 'USER_ROLE_CHANGED', label: 'User role changed' },
  { value: 'USER_SUSPENDED', label: 'User suspended' },
  { value: 'USER_REACTIVATED', label: 'User reactivated' },
];

const getErrorMessage = (result: unknown, fallback: string) => {
  if (
    typeof result === 'object' &&
    result !== null &&
    'message' in result &&
    typeof result.message === 'string'
  ) {
    return result.message;
  }

  return fallback;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const getActionConfig = (action: ActivityAction) => {
  const config: Record<
    ActivityAction,
    {
      label: string;
      description: string;
      className: string;
      icon: typeof BookCheck;
    }
  > = {
    COURSE_PUBLISHED: {
      label: 'Course published',
      description: 'Published a course for students.',
      className: 'bg-emerald-100 text-emerald-700',
      icon: BookCheck,
    },
    COURSE_REJECTED: {
      label: 'Course rejected',
      description: 'Rejected a course submission.',
      className: 'bg-rose-100 text-rose-700',
      icon: FileWarning,
    },
    COURSE_CHANGES_REQUESTED: {
      label: 'Changes requested',
      description: 'Returned a course to draft for improvements.',
      className: 'bg-amber-100 text-amber-800',
      icon: FileWarning,
    },
    USER_ROLE_CHANGED: {
      label: 'Role changed',
      description: 'Changed a platform user role.',
      className: 'bg-violet-100 text-violet-700',
      icon: UserCog,
    },
    USER_SUSPENDED: {
      label: 'User suspended',
      description: 'Suspended a user account.',
      className: 'bg-rose-100 text-rose-700',
      icon: ShieldAlert,
    },
    USER_REACTIVATED: {
      label: 'User reactivated',
      description: 'Restored a user account.',
      className: 'bg-emerald-100 text-emerald-700',
      icon: ShieldCheck,
    },
  };

  return config[action];
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'string') {
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

const getChangedValue = (
  previousValue: Record<string, unknown> | null,
  nextValue: Record<string, unknown> | null
) => {
  const key =
    Object.keys(nextValue ?? {})[0] ??
    Object.keys(previousValue ?? {})[0] ??
    'value';

  return {
    key: key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (character) => character.toUpperCase()),
    previous: previousValue?.[key],
    next: nextValue?.[key],
  };
};

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [actionFilter, setActionFilter] =
    useState<ActionFilter>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const [meta, setMeta] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const courseActivityCount = useMemo(() => {
    return logs.filter((log) => log.target.type === 'COURSE').length;
  }, [logs]);

  const userActivityCount = useMemo(() => {
    return logs.filter((log) => log.target.type === 'USER').length;
  }, [logs]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchActivityLogs = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: '15',
        });

        if (actionFilter !== 'ALL') {
          queryParams.set('action', actionFilter);
        }

        if (searchQuery.trim()) {
          queryParams.set('search', searchQuery.trim());
        }

        const response = await fetch(
          `${API_URL}/api/admin/activity-logs?${queryParams.toString()}`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          }
        );

        const result = (await response.json()) as
          | ActivityLogsResponse
          | FailedResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            getErrorMessage(result, 'Unable to load activity logs.')
          );
        }

        setLogs(result.data);
        setMeta(result.meta);
        setError('');
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setLogs([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load activity logs.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setHasLoaded(true);
          setIsRefreshing(false);
        }
      }
    };

    void fetchActivityLogs();

    return () => {
      controller.abort();
    };
  }, [actionFilter, page, reloadKey, searchQuery]);

  const refreshActivityLogs = () => {
    setIsRefreshing(true);
    setReloadKey((currentValue) => currentValue + 1);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const changeActionFilter = (nextFilter: ActionFilter) => {
    setPage(1);
    setActionFilter(nextFilter);
  };

  const exportCsv = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();

      if (actionFilter !== 'ALL') {
        queryParams.set('action', actionFilter);
      }

      if (searchQuery.trim()) {
        queryParams.set('search', searchQuery.trim());
      }

      const response = await fetch(
        `${API_URL}/api/admin/activity-logs/export?${queryParams.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        const result = (await response.json()) as FailedResponse;

        throw new Error(
          getErrorMessage(result, 'Unable to export activity logs.')
        );
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const date = new Date().toISOString().slice(0, 10);
      const downloadLink = document.createElement('a');

      downloadLink.href = objectUrl;
      downloadLink.download = `skillsphere-activity-log-${date}.csv`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(objectUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to export activity logs.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const goToPage = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage > meta.totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-indigo-600'>
            Administration
          </p>

          <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
            Activity log
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Review and export a history of important platform administration
            actions.
          </p>
        </div>

        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => void exportCsv()}
            disabled={isExporting}
            className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isExporting ? (
              <LoaderCircle className='h-4 w-4 animate-spin' />
            ) : (
              <Download className='h-4 w-4' />
            )}

            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <button
            type='button'
            onClick={refreshActivityLogs}
            disabled={isRefreshing}
            className='inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      <section className='mt-6 grid gap-4 sm:grid-cols-3'>
        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-slate-500'>
                Total matching activities
              </p>
              <p className='mt-2 text-2xl font-bold tracking-tight text-slate-900'>
                {meta.total}
              </p>
            </div>
            <div className='grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700'>
              <Clock3 className='h-5 w-5' />
            </div>
          </div>
        </article>

        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-slate-500'>
                Course actions on this page
              </p>
              <p className='mt-2 text-2xl font-bold tracking-tight text-slate-900'>
                {courseActivityCount}
              </p>
            </div>
            <div className='grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700'>
              <BookCheck className='h-5 w-5' />
            </div>
          </div>
        </article>

        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-slate-500'>
                User actions on this page
              </p>
              <p className='mt-2 text-2xl font-bold tracking-tight text-slate-900'>
                {userActivityCount}
              </p>
            </div>
            <div className='grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700'>
              <Users className='h-5 w-5' />
            </div>
          </div>
        </article>
      </section>

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'>
        <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
          <form
            onSubmit={submitSearch}
            className='flex w-full max-w-xl gap-2'
          >
            <label className='relative min-w-0 flex-1'>
              <span className='sr-only'>Search activity logs</span>
              <Search className='pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder='Search admin, course, user, or email...'
                className='h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />
            </label>

            <button
              type='submit'
              className='h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700'
            >
              Search
            </button>
          </form>

          <label className='relative'>
            <span className='sr-only'>Filter by activity action</span>
            <select
              value={actionFilter}
              onChange={(event) =>
                changeActionFilter(event.target.value as ActionFilter)
              }
              className='h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-56'
            >
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500' />
          </label>
        </div>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
          <div>
            <p className='font-bold'>Activity log request failed</p>
            <p className='mt-1'>{error}</p>
          </div>
        </div>
      )}

      {!hasLoaded ? (
        <div className='grid min-h-96 place-items-center'>
          <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
            <LoaderCircle className='h-5 w-5 animate-spin' />
            Loading activity logs...
          </div>
        </div>
      ) : logs.length === 0 ? (
        <section className='mt-6 grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center'>
          <div>
            <Clock3 className='mx-auto h-12 w-12 text-slate-300' />
            <h2 className='mt-4 text-lg font-bold text-slate-800'>
              No activity found
            </h2>
            <p className='mt-2 max-w-sm text-sm leading-6 text-slate-500'>
              New course moderation and user-management actions will appear
              here automatically.
            </p>
          </div>
        </section>
      ) : (
        <section className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='divide-y divide-slate-100'>
            {logs.map((log) => {
              const actionConfig = getActionConfig(log.action);
              const ActionIcon = actionConfig.icon;
              const valueChange = getChangedValue(
                log.previousValue,
                log.nextValue
              );

              return (
                <article
                  key={log._id}
                  className='p-5 transition hover:bg-slate-50/70 sm:p-6'
                >
                  <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div className='flex min-w-0 gap-3'>
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${actionConfig.className}`}
                      >
                        <ActionIcon className='h-5 w-5' />
                      </div>

                      <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${actionConfig.className}`}
                          >
                            {actionConfig.label}
                          </span>
                          <span className='text-xs font-medium text-slate-500'>
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>

                        <p className='mt-3 text-sm leading-6 text-slate-700'>
                          <span className='font-bold text-slate-900'>
                            {log.actor.name}
                          </span>{' '}
                          <span className='text-slate-500'>
                            ({log.actor.email})
                          </span>{' '}
                          {actionConfig.description}
                        </p>

                        <div className='mt-2 flex flex-wrap items-center gap-2 text-sm'>
                          <span className='font-medium text-slate-500'>
                            {log.target.type === 'COURSE'
                              ? 'Course:'
                              : 'User:'}
                          </span>
                          <span className='font-bold text-slate-800'>
                            {log.target.name}
                          </span>
                          {log.target.email && (
                            <span className='text-slate-500'>
                              ({log.target.email})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-sm'>
                      <p className='text-xs font-medium text-slate-500'>
                        {valueChange.key}
                      </p>
                      <div className='mt-1 flex items-center gap-2 font-semibold'>
                        <span className='text-slate-500'>
                          {formatValue(valueChange.previous)}
                        </span>
                        <ArrowLeftRight className='h-4 w-4 text-slate-400' />
                        <span className='text-slate-900'>
                          {formatValue(valueChange.next)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {log.note && (
                    <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3'>
                      <p className='text-xs font-bold text-amber-900'>
                        Review note
                      </p>
                      <p className='mt-1 text-sm leading-6 text-amber-800'>
                        {log.note}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className='flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-slate-500'>
              Showing{' '}
              <span className='font-semibold text-slate-700'>
                {(meta.page - 1) * meta.limit + 1}
              </span>{' '}
              to{' '}
              <span className='font-semibold text-slate-700'>
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{' '}
              of{' '}
              <span className='font-semibold text-slate-700'>
                {meta.total}
              </span>{' '}
              activities
            </p>

            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className='grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                aria-label='Previous page'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>

              <span className='min-w-24 text-center text-sm font-semibold text-slate-700'>
                Page {meta.page} of {meta.totalPages}
              </span>

              <button
                type='button'
                onClick={() => goToPage(page + 1)}
                disabled={page >= meta.totalPages}
                className='grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                aria-label='Next page'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
