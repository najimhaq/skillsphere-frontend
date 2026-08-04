'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  Ban,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  UserCog,
  Users,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
type AccountStatus = 'ACTIVE' | 'SUSPENDED';

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  success: true;
  data: AdminUser[];
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

type RoleFilter = 'ALL' | UserRole;
type StatusFilter = 'ALL' | AccountStatus;

const roleOptions: Array<{
  value: RoleFilter;
  label: string;
}> = [
  { value: 'ALL', label: 'All roles' },
  { value: 'STUDENT', label: 'Students' },
  { value: 'INSTRUCTOR', label: 'Instructors' },
  { value: 'ADMIN', label: 'Admins' },
];

const statusOptions: Array<{
  value: StatusFilter;
  label: string;
}> = [
  { value: 'ALL', label: 'All account statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const roleSelectOptions: Array<{
  value: UserRole;
  label: string;
}> = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'INSTRUCTOR', label: 'Instructor' },
  { value: 'ADMIN', label: 'Admin' },
];

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

const getInitials = (name: string) => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase() || 'U'
  );
};

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

const getRoleBadge = (role: UserRole) => {
  const styles: Record<
    UserRole,
    {
      label: string;
      className: string;
    }
  > = {
    STUDENT: {
      label: 'Student',
      className: 'bg-sky-100 text-sky-700',
    },
    INSTRUCTOR: {
      label: 'Instructor',
      className: 'bg-violet-100 text-violet-700',
    },
    ADMIN: {
      label: 'Admin',
      className: 'bg-indigo-100 text-indigo-700',
    },
  };

  return styles[role];
};

const getAccountStatusBadge = (accountStatus: AccountStatus) => {
  const styles: Record<
    AccountStatus,
    {
      label: string;
      className: string;
    }
  > = {
    ACTIVE: {
      label: 'Active',
      className: 'bg-emerald-100 text-emerald-700',
    },
    SUSPENDED: {
      label: 'Suspended',
      className: 'bg-rose-100 text-rose-700',
    },
  };

  return styles[accountStatus];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingActionUserId, setPendingActionUserId] = useState('');

  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const activeUserCount = useMemo(() => {
    return users.filter((user) => user.accountStatus === 'ACTIVE').length;
  }, [users]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: '10',
        });

        if (roleFilter !== 'ALL') {
          queryParams.set('role', roleFilter);
        }

        if (statusFilter !== 'ALL') {
          queryParams.set('accountStatus', statusFilter);
        }

        if (searchQuery.trim()) {
          queryParams.set('search', searchQuery.trim());
        }

        const response = await fetch(
          `${API_URL}/api/admin/users?${queryParams.toString()}`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          }
        );

        const result = (await response.json()) as
          | UsersResponse
          | FailedResponse;

        if (!response.ok || !result.success) {
          throw new Error(getErrorMessage(result, 'Unable to load users.'));
        }

        setUsers(result.data);
        setMeta(result.meta);
        setError('');
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setUsers([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load users.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setHasLoaded(true);
          setIsRefreshing(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      controller.abort();
    };
  }, [page, reloadKey, roleFilter, searchQuery, statusFilter]);

  const refreshUsers = () => {
    setIsRefreshing(true);
    setReloadKey((currentValue) => currentValue + 1);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleRoleFilterChange = (nextRole: RoleFilter) => {
    setPage(1);
    setRoleFilter(nextRole);
  };

  const handleStatusFilterChange = (nextStatus: StatusFilter) => {
    setPage(1);
    setStatusFilter(nextStatus);
  };

  const updateUserInState = (updatedUser: AdminUser) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      )
    );
  };

  const handleRoleChange = async (user: AdminUser, nextRole: UserRole) => {
    if (user.role === nextRole || pendingActionUserId) {
      return;
    }

    const confirmed = window.confirm(
      `Change ${user.name}'s role from ${user.role} to ${nextRole}?`
    );

    if (!confirmed) {
      return;
    }

    setPendingActionUserId(user._id);
    setActionError('');

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}/role`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: nextRole,
          }),
        }
      );

      const result = (await response.json()) as
        | {
            success: true;
            message: string;
            data: AdminUser;
          }
        | FailedResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(result, 'Unable to update the user role.')
        );
      }

      updateUserInState(result.data);
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update the user role.'
      );
    } finally {
      setPendingActionUserId('');
    }
  };

  const handleAccountStatusChange = async (user: AdminUser) => {
    if (pendingActionUserId) {
      return;
    }

    const nextStatus: AccountStatus =
      user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    const actionLabel = nextStatus === 'SUSPENDED' ? 'suspend' : 'reactivate';

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    setPendingActionUserId(user._id);
    setActionError('');

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}/account-status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountStatus: nextStatus,
          }),
        }
      );

      const result = (await response.json()) as
        | {
            success: true;
            message: string;
            data: AdminUser;
          }
        | FailedResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(result, `Unable to ${actionLabel} this user.`)
        );
      }

      updateUserInState(result.data);
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : `Unable to ${actionLabel} this user.`
      );
    } finally {
      setPendingActionUserId('');
    }
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > meta.totalPages || nextPage === page) {
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
            User management
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Search users, manage account access, and assign platform roles.
          </p>
        </div>

        <button
          type='button'
          onClick={refreshUsers}
          disabled={isRefreshing}
          className='inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      <section className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-slate-500'>
                Total matching users
              </p>
              <p className='mt-2 text-2xl font-bold tracking-tight text-slate-900'>
                {meta.total}
              </p>
            </div>

            <div className='grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700'>
              <Users className='h-5 w-5' />
            </div>
          </div>
        </article>

        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-slate-500'>
                Active on this page
              </p>
              <p className='mt-2 text-2xl font-bold tracking-tight text-slate-900'>
                {activeUserCount}
              </p>
            </div>

            <div className='grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700'>
              <BadgeCheck className='h-5 w-5' />
            </div>
          </div>
        </article>

        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Current page</p>
              <p className='mt-2 text-2xl font-bold tracking-tight text-slate-900'>
                {meta.page} / {meta.totalPages}
              </p>
            </div>

            <div className='grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700'>
              <CircleUserRound className='h-5 w-5' />
            </div>
          </div>
        </article>

        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-slate-500'>Page size</p>
              <p className='mt-2 text-2xl font-bold tracking-tight text-slate-900'>
                {meta.limit}
              </p>
            </div>

            <div className='grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700'>
              <UserCog className='h-5 w-5' />
            </div>
          </div>
        </article>
      </section>

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'>
        <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
          <form
            onSubmit={handleSearchSubmit}
            className='flex w-full max-w-xl gap-2'
          >
            <label className='relative min-w-0 flex-1'>
              <span className='sr-only'>Search users</span>

              <Search className='pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400' />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder='Search by name or email...'
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

          <div className='grid gap-3 sm:grid-cols-2'>
            <label className='relative'>
              <span className='sr-only'>Filter by role</span>

              <select
                value={roleFilter}
                onChange={(event) =>
                  handleRoleFilterChange(event.target.value as RoleFilter)
                }
                className='h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-44'
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500' />
            </label>

            <label className='relative'>
              <span className='sr-only'>Filter by account status</span>

              <select
                value={statusFilter}
                onChange={(event) =>
                  handleStatusFilterChange(event.target.value as StatusFilter)
                }
                className='h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-52'
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500' />
            </label>
          </div>
        </div>
      </section>

      {error && (
        <div className='mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>Unable to load users</p>
            <p className='mt-1'>{error}</p>
          </div>
        </div>
      )}

      {actionError && (
        <div className='mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>
          <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />

          <div>
            <p className='font-bold'>User action failed</p>
            <p className='mt-1'>{actionError}</p>
          </div>
        </div>
      )}

      {!hasLoaded ? (
        <div className='grid min-h-96 place-items-center'>
          <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
            <LoaderCircle className='h-5 w-5 animate-spin' />
            Loading users...
          </div>
        </div>
      ) : users.length === 0 ? (
        <section className='mt-6 grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center'>
          <div>
            <Users className='mx-auto h-12 w-12 text-slate-300' />

            <h2 className='mt-4 text-lg font-bold text-slate-800'>
              No users found
            </h2>

            <p className='mt-2 max-w-sm text-sm leading-6 text-slate-500'>
              Try changing the search query or clearing one of the filters.
            </p>
          </div>
        </section>
      ) : (
        <section className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='min-w-[1000px] w-full text-left'>
              <thead className='border-b border-slate-200 bg-slate-50'>
                <tr>
                  <th className='px-5 py-4 text-xs font-bold tracking-wide text-slate-500 uppercase'>
                    User
                  </th>
                  <th className='px-5 py-4 text-xs font-bold tracking-wide text-slate-500 uppercase'>
                    Role
                  </th>
                  <th className='px-5 py-4 text-xs font-bold tracking-wide text-slate-500 uppercase'>
                    Account
                  </th>
                  <th className='px-5 py-4 text-xs font-bold tracking-wide text-slate-500 uppercase'>
                    Joined
                  </th>
                  <th className='px-5 py-4 text-right text-xs font-bold tracking-wide text-slate-500 uppercase'>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-slate-100'>
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const accountBadge = getAccountStatusBadge(
                    user.accountStatus
                  );
                  const isPending = pendingActionUserId === user._id;

                  return (
                    <tr
                      key={user._id}
                      className='transition hover:bg-slate-50/80'
                    >
                      <td className='px-5 py-4'>
                        <div className='flex items-center gap-3'>
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className='h-10 w-10 rounded-full border border-slate-200 object-cover'
                            />
                          ) : (
                            <div className='grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700'>
                              {getInitials(user.name)}
                            </div>
                          )}

                          <div className='min-w-0'>
                            <p className='truncate text-sm font-bold text-slate-800'>
                              {user.name}
                            </p>

                            <p className='mt-0.5 truncate text-xs text-slate-500'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className='px-5 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${roleBadge.className}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className='px-5 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${accountBadge.className}`}
                        >
                          {accountBadge.label}
                        </span>
                      </td>

                      <td className='px-5 py-4 text-sm font-medium text-slate-600'>
                        {formatDate(user.createdAt)}
                      </td>

                      <td className='px-5 py-4'>
                        <div className='flex items-center justify-end gap-2'>
                          <label className='relative'>
                            <span className='sr-only'>
                              Change {user.name}'s role
                            </span>

                            <select
                              value={user.role}
                              disabled={
                                isPending || Boolean(pendingActionUserId)
                              }
                              onChange={(event) =>
                                void handleRoleChange(
                                  user,
                                  event.target.value as UserRole
                                )
                              }
                              className='h-9 appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pr-8 pl-3 text-xs font-bold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60'
                            >
                              {roleSelectOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>

                            <ChevronDown className='pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500' />
                          </label>

                          <button
                            type='button'
                            disabled={isPending || Boolean(pendingActionUserId)}
                            onClick={() => void handleAccountStatusChange(user)}
                            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              user.accountStatus === 'ACTIVE'
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {isPending ? (
                              <LoaderCircle className='h-3.5 w-3.5 animate-spin' />
                            ) : user.accountStatus === 'ACTIVE' ? (
                              <Ban className='h-3.5 w-3.5' />
                            ) : (
                              <ShieldCheck className='h-3.5 w-3.5' />
                            )}

                            {isPending
                              ? 'Saving'
                              : user.accountStatus === 'ACTIVE'
                                ? 'Suspend'
                                : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              <span className='font-semibold text-slate-700'>{meta.total}</span>{' '}
              users
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

      <section className='mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
        <ShieldOff className='mt-0.5 h-5 w-5 shrink-0 text-amber-700' />

        <p className='leading-6'>
          Suspending an account blocks its access to protected platform APIs.
          Role changes are privileged actions—confirm each change carefully.
        </p>
      </section>
    </div>
  );
}
