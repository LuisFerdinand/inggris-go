// app/(dashboard)/dashboard/users/_modules/UsersView.tsx

"use client";

import { useDeferredValue, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Inbox,
  Loader2,
  Mail,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";

import type { UserListItem } from "@/app/modules/user/server/user.router";

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_SIZE = 20;

type RoleName =
  | "guest"
  | "user"
  | "student"
  | "teacher"
  | "author"
  | "admin"
  | "super_admin";

const ROLE_META: Record<
  RoleName,
  {
    label: string;
    className: string;
  }
> = {
  guest: {
    label: "Guest",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  user: {
    label: "User",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  student: {
    label: "Student",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  teacher: {
    label: "Teacher",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  author: {
    label: "Author",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  admin: {
    label: "Admin",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  super_admin: {
    label: "Super Admin",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";

  const parts = source.split(" ").filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function RoleBadge({ role }: { role: RoleName }) {
  const meta = ROLE_META[role] ?? ROLE_META.user;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 className="size-3" />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
      Not Verified
    </span>
  );
}

/* =========================================================
   SUMMARY CARDS
========================================================= */

function SummaryCards({
  total,
  items,
}: {
  total: number;
  items: UserListItem[];
}) {
  const stats = useMemo(() => {
    const verified = items.filter((item) => item.emailVerified).length;

    const admins = items.filter(
      (item) =>
        item.primaryRole === "admin" || item.primaryRole === "super_admin",
    ).length;

    return {
      verified,
      unverified: items.length - verified,
      admins,
    };
  }, [items]);

  const cards = [
    {
      label: "Total User",
      value: total.toLocaleString("id-ID"),
      icon: Users,
      tint: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Verified di Halaman Ini",
      value: stats.verified.toLocaleString("id-ID"),
      icon: CheckCircle2,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Belum Verified",
      value: stats.unverified.toLocaleString("id-ID"),
      icon: Mail,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Admin di Halaman Ini",
      value: stats.admins.toLocaleString("id-ID"),
      icon: ShieldCheck,
      tint: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              card.tint,
            )}
          >
            <card.icon className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400">
              {card.label}
            </p>
            <p className="truncate text-[16px] font-black text-slate-800">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   FILTER BAR
========================================================= */

function FilterBar({
  search,
  role,
  roleOptions,
  onSearchChange,
  onRoleChange,
  onReset,
}: {
  search: string;
  role: string;
  roleOptions: { value: string; label: string }[];
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onReset: () => void;
}) {
  const hasFilter = search || role;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama, email, atau nomor HP..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-9 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="hidden items-center gap-1.5 text-slate-400 sm:flex">
          <Filter className="size-3.5" />
        </div>

        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-[13px] font-bold text-slate-700 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Semua Role</option>

          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {ROLE_META[option.value as RoleName]?.label ?? option.label}
            </option>
          ))}
        </select>

        {hasFilter && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="size-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   USER ROW
========================================================= */

function UserRow({
  item,
  roleOptions,
  onChanged,
}: {
  item: UserListItem;
  roleOptions: { value: string; label: string }[];
  onChanged: () => void;
}) {
  const updateRole = trpc.users.updateUserRole.useMutation({
    onSuccess: () => {
        toast.success("Role user berhasil diperbarui");
        onChanged();
    },
    onError: (error) => {
        toast.error(error.message || "Gagal memperbarui role user");
    },
    });

    const updateStatus = trpc.users.updateUserStatus.useMutation({
    onSuccess: () => {
        toast.success("Status user berhasil diperbarui");
        onChanged();
    },
    onError: (error) => {
        toast.error(error.message || "Gagal memperbarui status user");
    },
    });

  const isUpdating = updateRole.isPending || updateStatus.isPending;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-[13px] font-black text-indigo-600">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.name}
                className="size-full object-cover"
              />
            ) : (
              getInitials(item.name, item.email)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[14px] font-black text-slate-800">
                {item.name}
              </p>

              <RoleBadge role={item.primaryRole as RoleName} />

              <VerificationBadge verified={item.emailVerified} />
            </div>

            <div className="mt-1.5 flex flex-col gap-1 text-[12px] text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Mail className="size-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{item.email}</span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 shrink-0 text-slate-400" />
                {item.phone || "No phone"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 shrink-0 text-slate-400" />
                {item.age ? `${item.age} tahun` : "Age empty"}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] font-medium text-slate-400">
              Bergabung {formatDate(item.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
            <Shield className="size-3.5 text-slate-400" />

            <select
              value={item.primaryRole}
              disabled={isUpdating}
              onChange={(e) => {
                updateRole.mutate({
                  userId: item.id,
                  role: e.target.value as RoleName,
                });
              }}
              className="bg-transparent text-[12px] font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {ROLE_META[option.value as RoleName]?.label ?? option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => {
              updateStatus.mutate({
                userId: item.id,
                emailVerified: !item.emailVerified,
              });
            }}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              item.emailVerified
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
            )}
          >
            {isUpdating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : item.emailVerified ? (
              <>
                <X className="size-3.5" />
                Unverify
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                Verify
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[12px] font-semibold text-slate-500">
        Total{" "}
        <span className="font-black text-slate-800">
          {total.toLocaleString("id-ID")}
        </span>{" "}
        user
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" />
          Prev
        </button>

        <div className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-black text-slate-600">
          {page} / {totalPages}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN VIEW
========================================================= */

export function UsersView() {
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(search.trim());

  const queryInput = useMemo(
    () => ({
      search: deferredSearch || undefined,
      role: role ? (role as RoleName) : undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [deferredSearch, role, page],
  );

const usersQuery = trpc.users.getAll.useQuery(queryInput);

const roleOptionsQuery = trpc.users.getRoleOptions.useQuery();

  const data = usersQuery.data;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const roleOptions = roleOptionsQuery.data ?? [];

  function refetch() {
    void utils.users.getAll.invalidate();
    void utils.users.getById.invalidate();
  }

  function resetFilters() {
    setSearch("");
    setRole("");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            {
              label: "Dashboard",
              href: "/dashboard",
            },
            {
              label: "Pengguna",
              icon: <Users />,
            },
          ]}
          title="Manajemen Pengguna"
          description="Kelola akun, role, dan status verifikasi pengguna platform."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10">
        <SummaryCards total={total} items={items} />

        <FilterBar
          search={search}
          role={role}
          roleOptions={roleOptions}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onRoleChange={(value) => {
            setRole(value);
            setPage(1);
          }}
          onReset={resetFilters}
        />

        {usersQuery.isLoading && !data ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-slate-400 shadow-sm">
            <Loader2 className="size-5 animate-spin" />
            <p className="text-[13px] font-semibold">Memuat data user…</p>
          </div>
        ) : usersQuery.isError ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-16 text-center">
            <UserCog className="size-8 text-red-400" />

            <div>
              <p className="text-[13px] font-black text-red-700">
                Gagal memuat data user
              </p>
              <p className="mt-1 max-w-md text-[12px] font-medium text-red-500">
                {usersQuery.error.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              className="rounded-xl bg-red-600 px-4 py-2 text-[12px] font-black text-white transition-colors hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
            <Inbox className="size-8 text-slate-300" />

            <div>
              <p className="text-[13px] font-black text-slate-600">
                Tidak ada user ditemukan
              </p>
              <p className="mt-1 max-w-md text-[12px] font-medium text-slate-400">
                {search || role
                  ? "Coba ubah pencarian atau filter role."
                  : "User baru akan muncul di sini setelah melakukan registrasi."}
              </p>
            </div>

            {(search || role) && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-black text-slate-600 transition-colors hover:bg-slate-50"
              >
                <SlidersHorizontal className="size-3.5" />
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {items.map((item) => (
                <UserRow
                  key={item.id}
                  item={item}
                  roleOptions={roleOptions}
                  onChanged={refetch}
                />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}