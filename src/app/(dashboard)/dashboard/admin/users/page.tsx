'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Ban,
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

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiResponse =
  | { success: true; data: AdminUser[]; meta: Meta }
  | { success: false; message?: string };

const getErrorMessage = (result: unknown, fallback: string) =>
  typeof result === 'object' &&
  result !== null &&
  'message' in result &&
  typeof result.message === 'string'
    ? result.message
    : fallback;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase() || 'U';

const roleBadge = (role: UserRole) => {
  if (role === 'ADMIN') {
    return { label: 'Admin', color: 'bg-indigo-100 text-indigo-700' };
  }

  if (role === 'INSTRUCTOR') {
    return {
      label: 'Instructor',
      color: 'bg-violet-100 text-violet-700',
    };
  }

  return { label: 'Student', color: 'bg-sky-100 text-sky-700' };
};

const statusBadge = (status: AccountStatus) =>
  status === 'ACTIVE'
    ? { label: 'Active', color: 'bg-emerald-100 text-emerald-700' }
    : { label: 'Suspended', color: 'bg-rose-100 text-rose-700' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>(
    'ALL'
  );
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingActionUserId, setPendingActionUserId] = useState('');

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    user: AdminUser;
    nextRole: UserRole;
  } | null>(null);

  const activeUserCount = useMemo(
    () => users.filter((user) => user.accountStatus === 'ACTIVE').length,
    [users]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
        });

        if (roleFilter !== 'ALL') params.set('role', roleFilter);
        if (statusFilter !== 'ALL') {
          params.set('accountStatus', statusFilter);
        }
        if (searchQuery.trim()) params.set('search', searchQuery.trim());

        const response = await fetch(
          `${API_URL}/api/admin/users?${params.toString()}`,
          {
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
          }
        );

        const result = (await response.json()) as ApiResponse;

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

    void loadUsers();

    return () => controller.abort();
  }, [page, roleFilter, statusFilter, searchQuery, reloadKey]);

  const updateUser = (updatedUser: AdminUser) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      )
    );
  };

  const closeRoleModal = () => {
    if (pendingActionUserId) return;

    setActionError('');
    setRoleChangeTarget(null);
  };

  const openRoleModal = (user: AdminUser, nextRole: UserRole) => {
    if (user.role === nextRole || pendingActionUserId) return;

    setActionError('');
    setRoleChangeTarget({ user, nextRole });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeTarget) return;

    const { user, nextRole } = roleChangeTarget;

    setPendingActionUserId(user._id);
    setActionError('');

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}/role`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: nextRole }),
        }
      );

      const result = (await response.json()) as
        | { success: true; data: AdminUser; message: string }
        | { success: false; message?: string };

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(result, 'Unable to update the user role.')
        );
      }

      updateUser(result.data);
      setRoleChangeTarget(null);
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

  const changeAccountStatus = async (user: AdminUser) => {
    if (pendingActionUserId) return;

    const nextStatus: AccountStatus =
      user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    const action = nextStatus === 'SUSPENDED' ? 'suspend' : 'reactivate';

    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountStatus: nextStatus }),
        }
      );

      const result = (await response.json()) as
        | { success: true; data: AdminUser; message: string }
        | { success: false; message?: string };

      if (!response.ok || !result.success) {
        throw new Error(
          getErrorMessage(result, `Unable to ${action} this user.`)
        );
      }

      updateUser(result.data);
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : `Unable to ${action} this user.`
      );
    } finally {
      setPendingActionUserId('');
    }
  };

  return (
    <div className='mx-auto max-w-7xl'>
      <section className='flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold text-indigo-600'>
            Administration
          </p>
          <h1 className='mt-1 text-3xl font-bold text-slate-900'>
            User management
          </h1>
          <p className='mt-2 text-sm text-slate-600'>
            Search users, manage account access, and assign platform roles.
          </p>
        </div>

        <button
          type='button'
          onClick={() => {
            setIsRefreshing(true);
            setReloadKey((value) => value + 1);
          }}
          className='inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700'
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      <section className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          [
            'Total matching users',
            meta.total,
            Users,
            'bg-indigo-100 text-indigo-700',
          ],
          [
            'Active on this page',
            activeUserCount,
            BadgeCheck,
            'bg-emerald-100 text-emerald-700',
          ],
          [
            'Current page',
            `${meta.page} / ${meta.totalPages}`,
            CircleUserRound,
            'bg-violet-100 text-violet-700',
          ],
          ['Page size', meta.limit, UserCog, 'bg-amber-100 text-amber-700'],
        ].map(([label, value, Icon, color]) => {
          const CardIcon = Icon as typeof Users;

          return (
            <article
              key={String(label)}
              className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-slate-500'>{String(label)}</p>
                  <p className='mt-2 text-2xl font-bold text-slate-900'>
                    {String(value)}
                  </p>
                </div>
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ${String(color)}`}
                >
                  <CardIcon className='h-5 w-5' />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
        <div className='flex flex-col gap-4 xl:flex-row xl:justify-between'>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearchQuery(searchInput.trim());
            }}
            className='flex w-full max-w-xl gap-2'
          >
            <label className='relative flex-1'>
              <Search className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400' />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder='Search by name or email...'
                className='h-11 w-full rounded-xl border border-slate-200 py-2 pr-3 pl-10 text-sm outline-none'
              />
            </label>

            <button
              type='submit'
              className='rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white'
            >
              Search
            </button>
          </form>

          <div className='grid gap-3 sm:grid-cols-2'>
            <select
              value={roleFilter}
              onChange={(event) => {
                setPage(1);
                setRoleFilter(event.target.value as 'ALL' | UserRole);
              }}
              className='h-11 rounded-xl border border-slate-200 px-3 text-sm'
            >
              <option value='ALL'>All roles</option>
              <option value='STUDENT'>Students</option>
              <option value='INSTRUCTOR'>Instructors</option>
              <option value='ADMIN'>Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value as 'ALL' | AccountStatus);
              }}
              className='h-11 rounded-xl border border-slate-200 px-3 text-sm'
            >
              <option value='ALL'>All account statuses</option>
              <option value='ACTIVE'>Active</option>
              <option value='SUSPENDED'>Suspended</option>
            </select>
          </div>
        </div>
      </section>

      {error && (
        <div className='mt-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700'>
          <AlertCircle className='h-5 w-5 shrink-0' />
          <div>
            <p className='font-bold'>Unable to load users</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!hasLoaded ? (
        <div className='grid min-h-96 place-items-center'>
          <LoaderCircle className='h-6 w-6 animate-spin text-slate-500' />
        </div>
      ) : users.length === 0 ? (
        <section className='mt-6 grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50'>
          <div className='text-center'>
            <Users className='mx-auto h-12 w-12 text-slate-300' />
            <h2 className='mt-4 text-lg font-bold'>No users found</h2>
          </div>
        </section>
      ) : (
        <section className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-250 text-left'>
              <thead className='bg-slate-50 text-xs text-slate-500 uppercase'>
                <tr>
                  <th className='px-5 py-4'>User</th>
                  <th className='px-5 py-4'>Role</th>
                  <th className='px-5 py-4'>Account</th>
                  <th className='px-5 py-4'>Joined</th>
                  <th className='px-5 py-4 text-right'>Actions</th>
                </tr>
              </thead>

              <tbody className='divide-y divide-slate-100'>
                {users.map((user) => {
                  const role = roleBadge(user.role);
                  const status = statusBadge(user.accountStatus);
                  const isPending = pendingActionUserId === user._id;

                  return (
                    <tr key={user._id}>
                      <td className='px-5 py-4'>
                        <div className='flex items-center gap-3'>
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={40}
                              height={40}
                              className='h-10 w-10 rounded-full object-cover'
                            />
                          ) : (
                            <div className='grid h-10 w-10 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700'>
                              {getInitials(user.name)}
                            </div>
                          )}

                          <div>
                            <p className='font-bold text-slate-800'>
                              {user.name}
                            </p>
                            <p className='text-xs text-slate-500'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className='px-5 py-4'>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${role.color}`}
                        >
                          {role.label}
                        </span>
                      </td>

                      <td className='px-5 py-4'>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className='px-5 py-4 text-sm text-slate-600'>
                        {formatDate(user.createdAt)}
                      </td>

                      <td className='px-5 py-4'>
                        <div className='flex justify-end gap-2'>
                          <select
                            value={user.role}
                            disabled={Boolean(pendingActionUserId)}
                            onChange={(event) =>
                              openRoleModal(
                                user,
                                event.target.value as UserRole
                              )
                            }
                            className='h-9 rounded-lg border border-slate-200 px-2 text-xs font-bold'
                          >
                            <option value='STUDENT'>Student</option>
                            <option value='INSTRUCTOR'>Instructor</option>
                            <option value='ADMIN'>Admin</option>
                          </select>

                          <button
                            type='button'
                            disabled={Boolean(pendingActionUserId)}
                            onClick={() => void changeAccountStatus(user)}
                            className={`inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-bold text-white ${
                              user.accountStatus === 'ACTIVE'
                                ? 'bg-rose-600'
                                : 'bg-emerald-600'
                            }`}
                          >
                            {isPending ? (
                              <LoaderCircle className='h-4 w-4 animate-spin' />
                            ) : user.accountStatus === 'ACTIVE' ? (
                              <Ban className='h-4 w-4' />
                            ) : (
                              <ShieldCheck className='h-4 w-4' />
                            )}
                            {user.accountStatus === 'ACTIVE'
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

          <div className='flex items-center justify-between border-t px-5 py-4'>
            <p className='text-sm text-slate-500'>
              Showing {(meta.page - 1) * meta.limit + 1} to{' '}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>

            <div className='flex items-center gap-2'>
              <button
                type='button'
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className='grid h-9 w-9 place-items-center rounded-lg border'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>

              <span className='text-sm font-semibold'>
                Page {meta.page} of {meta.totalPages}
              </span>

              <button
                type='button'
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className='grid h-9 w-9 place-items-center rounded-lg border'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </section>
      )}

      <section className='mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>
        <ShieldOff className='h-5 w-5 shrink-0' />
        <p>
          Suspending an account blocks its access to protected platform APIs.
          Role changes are privileged actions.
        </p>
      </section>

      {roleChangeTarget && (
        <div
          className='fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/50 p-4'
          onClick={closeRoleModal}
        >
          <div
            className='w-full max-w-md rounded-2xl bg-white shadow-2xl'
            onClick={(event) => event.stopPropagation()}
          >
            <div className='border-b border-slate-100 px-6 py-5'>
              <div className='flex gap-3'>
                <div className='grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-amber-700'>
                  <AlertTriangle className='h-5 w-5' />
                </div>

                <div>
                  <h2 className='text-lg font-bold text-slate-900'>
                    Change user role?
                  </h2>
                  <p className='mt-1 text-sm text-slate-600'>
                    This will update the user&apos;s platform permissions
                    immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className='px-6 py-5'>
              <div className='rounded-xl bg-slate-50 p-4 text-sm text-slate-700'>
                Change <strong>{roleChangeTarget.user.name}</strong> from{' '}
                <strong>{roleBadge(roleChangeTarget.user.role).label}</strong>{' '}
                to <strong>{roleBadge(roleChangeTarget.nextRole).label}</strong>
                ?
              </div>

              {actionError && (
                <div className='mt-4 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700'>
                  <AlertCircle className='h-4 w-4 shrink-0' />
                  <p>{actionError}</p>
                </div>
              )}
            </div>

            <div className='flex justify-end gap-3 border-t border-slate-100 px-6 py-5'>
              <button
                type='button'
                onClick={closeRoleModal}
                disabled={Boolean(pendingActionUserId)}
                className='rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700'
              >
                Cancel
              </button>

              <button
                type='button'
                onClick={() => void confirmRoleChange()}
                disabled={Boolean(pendingActionUserId)}
                className='inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white'
              >
                {pendingActionUserId ? (
                  <>
                    <LoaderCircle className='h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Confirm role change'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
