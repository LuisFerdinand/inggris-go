// app/(dashboard)/dashboard/orders/_modules/OrdersView.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
  Tag,
  Wallet,
  X,
  Filter,
  Inbox,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageNav, PageHeader } from "@/components/PageHeader";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

function formatIDR(v: number | null | undefined) {
  if (v == null) return "—";
  return `Rp ${v.toLocaleString("id-ID")}`;
}

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

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─────────────────────────────────────────────────────────────
   STATUS META + BADGES
───────────────────────────────────────────────────────────── */

const ENROLLMENT_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  pending_payment: {
    label: "Menunggu Bayar",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  paid: {
    label: "Lunas",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  confirmed: {
    label: "Terkonfirmasi",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

const PAYMENT_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Menunggu",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  paid: {
    label: "Dibayar",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  failed: {
    label: "Gagal",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  refunded: {
    label: "Refund",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

const ENROLLMENT_STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending_payment", label: "Menunggu Bayar" },
  { value: "paid", label: "Lunas" },
  { value: "confirmed", label: "Terkonfirmasi" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "expired", label: "Kedaluwarsa" },
];

const ENROLLMENT_STATUS_ACTIONS: {
  value: "pending_payment" | "paid" | "confirmed" | "cancelled" | "expired";
  label: string;
}[] = [
  { value: "pending_payment", label: "Tandai Menunggu Bayar" },
  { value: "paid", label: "Tandai Lunas" },
  { value: "confirmed", label: "Tandai Terkonfirmasi" },
  { value: "cancelled", label: "Batalkan" },
  { value: "expired", label: "Tandai Kedaluwarsa" },
];

function StatusBadge({
  status,
  meta,
}: {
  status: string;
  meta: Record<string, { label: string; className: string }>;
}) {
  const m = meta[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   FILTER BAR
───────────────────────────────────────────────────────────── */

function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  programId,
  onProgramChange,
  programOptions,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  programId: string;
  onProgramChange: (v: string) => void;
  programOptions: { id: string; title: string; slug: string }[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama, email, atau nomor WhatsApp…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="size-3.5" />
        </div>

        <select
          value={programId}
          onChange={(e) => onProgramChange(e.target.value)}
          className="max-w-[220px] rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Semua Program</option>
          {programOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        >
          {ENROLLMENT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUMMARY CARDS
───────────────────────────────────────────────────────────── */

function SummaryCards({
  total,
  items,
}: {
  total: number;
  items: { status: string; pricing: { final: number } }[];
}) {
  const stats = useMemo(() => {
    const paid = items.filter((i) => i.status === "paid" || i.status === "confirmed");
    const pending = items.filter((i) => i.status === "pending_payment");
    const revenue = paid.reduce((sum, i) => sum + (i.pricing.final ?? 0), 0);

    return { paidCount: paid.length, pendingCount: pending.length, revenue };
  }, [items]);

  const cards = [
    {
      label: "Total Pesanan",
      value: total.toLocaleString("id-ID"),
      icon: ShoppingBag,
      tint: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Lunas / Terkonfirmasi",
      value: stats.paidCount.toLocaleString("id-ID"),
      icon: Wallet,
      tint: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Menunggu Pembayaran",
      value: stats.pendingCount.toLocaleString("id-ID"),
      icon: Calendar,
      tint: "text-amber-600 bg-amber-50",
    },
    {
      label: "Pendapatan (halaman ini)",
      value: formatIDR(stats.revenue),
      icon: Tag,
      tint: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
        >
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", c.tint)}>
            <c.icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400">{c.label}</p>
            <p className="truncate text-[15px] font-bold text-slate-800">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STATUS ACTION MENU
───────────────────────────────────────────────────────────── */

function StatusActionMenu({
  enrollmentId,
  currentStatus,
  payment,
  onChanged,
}: {
  enrollmentId: string;
  currentStatus: string;
  payment: { id: string; status: string } | null;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);

  const updateEnrollment = trpc.orders.updateEnrollmentStatus.useMutation({
    onSuccess: () => {
      toast.success("Status pendaftaran diperbarui");
      onChanged();
    },
    onError: (e) => toast.error(e.message || "Gagal memperbarui status"),
  });

  const updatePayment = trpc.orders.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("Status pembayaran diperbarui");
      onChanged();
    },
    onError: (e) => toast.error(e.message || "Gagal memperbarui pembayaran"),
  });

  const isPending = updateEnrollment.isPending || updatePayment.isPending;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <>
            Ubah Status <ChevronDown className="size-3" />
          </>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Status Pendaftaran
            </p>
            {ENROLLMENT_STATUS_ACTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.value === currentStatus}
                onClick={() => {
                  setOpen(false);
                  updateEnrollment.mutate({ id: enrollmentId, status: opt.value });
                }}
                className={cn(
                  "block w-full px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-slate-50",
                  opt.value === currentStatus
                    ? "cursor-default font-semibold text-indigo-600"
                    : "text-slate-600",
                )}
              >
                {opt.label}
              </button>
            ))}

            {payment && (
              <>
                <div className="my-1 border-t border-slate-100" />
                <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Status Pembayaran
                </p>
                {(
                  [
                    { value: "paid", label: "Tandai Dibayar" },
                    { value: "failed", label: "Tandai Gagal" },
                    { value: "refunded", label: "Tandai Refund" },
                    { value: "cancelled", label: "Batalkan Pembayaran" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.value === payment.status}
                    onClick={() => {
                      setOpen(false);
                      updatePayment.mutate({
                        paymentId: payment.id,
                        status: opt.value,
                      });
                    }}
                    className={cn(
                      "block w-full px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-slate-50",
                      opt.value === payment.status
                        ? "cursor-default font-semibold text-indigo-600"
                        : "text-slate-600",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROW — one order
───────────────────────────────────────────────────────────── */

type OrderItem = {
  id: string;
  type: string;
  status: string;
  customerName: string;
  phone: string;
  email: string | null;
  childName: string | null;
  age: number | null;
  program: {
    id: string;
    title: string | null;
    slug: string | null;
    thumbnail: string | null;
    format: string | null;
    level: string | null;
  };
  batch: {
    id: string | null;
    title: string;
    startDate: string | null;
    endDate: string | null;
    mode: string | null;
    location: string | null;
  } | null;
  package: {
    id: string;
    title: string | null;
    price: number | null;
    originalPrice: number | null;
  };
  pricing: {
    subtotal: number;
    discount: number;
    final: number;
    couponCode: string | null;
  };
  payment: {
    id: string;
    status: string;
    method: string | null;
    invoiceNumber: string;
    paymentUrl: string | null;
    paidAt: string | Date | null;
    expiredAt: string | Date | null;
  } | null;
  isManual: boolean;
  source: string | null;
  createdAt: string | Date;
  updatedAt: string | Date | null;
};

function OrderRow({ item, onChanged }: { item: OrderItem; onChanged: () => void }) {
  const displayName = item.childName || item.customerName;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4">
      {/* Avatar + identity */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[13px] font-bold text-indigo-600">
          {displayName?.[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[13px] font-bold text-slate-800">
              {displayName}
            </p>
            {item.isManual && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                Manual
              </span>
            )}
          </div>

          {item.childName && (
            <p className="text-[11px] text-slate-400">
              Wali: {item.customerName}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3" /> {item.phone}
            </span>
            {item.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3" /> {item.email}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" /> {formatDateTime(item.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Program + batch/package */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:px-2">
        {item.program.title && item.program.slug ? (
          <Link
            href={`/dashboard/programs/${item.program.id}?tab=enrollments`}
            className="group inline-flex items-center gap-1 truncate text-[12px] font-semibold text-slate-700 hover:text-indigo-600"
          >
            <span className="truncate">{item.program.title}</span>
            <ArrowUpRight className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ) : (
          <p className="truncate text-[12px] font-semibold text-slate-700">
            {item.program.title ?? "—"}
          </p>
        )}

        {item.batch ? (
          <p className="text-[11px] text-slate-400">
            {item.batch.title} • {formatDate(item.batch.startDate)}
          </p>
        ) : (
          <p className="text-[11px] text-slate-400">Tanpa batch</p>
        )}
        <p className="truncate text-[11px] text-slate-500">
          Paket: <span className="font-medium">{item.package.title ?? "—"}</span>
        </p>
      </div>

      {/* Price */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:px-2">
        <p className="text-[13px] font-bold text-slate-800">
          {formatIDR(item.pricing.final)}
        </p>
        {item.pricing.discount > 0 && (
          <p className="text-[11px] text-emerald-600">
            Diskon {formatIDR(item.pricing.discount)}
            {item.pricing.couponCode ? ` (${item.pricing.couponCode})` : ""}
          </p>
        )}
        {item.payment && (
          <p className="truncate text-[11px] text-slate-400">
            {item.payment.invoiceNumber}
          </p>
        )}
      </div>

      {/* Status + actions */}
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={item.status} meta={ENROLLMENT_STATUS_META} />
          {item.payment && (
            <StatusBadge status={item.payment.status} meta={PAYMENT_STATUS_META} />
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.payment?.paymentUrl && item.payment.status === "pending" && (
            <a
              href={item.payment.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              Link pembayaran <ExternalLink className="size-3" />
            </a>
          )}

          <StatusActionMenu
            enrollmentId={item.id}
            currentStatus={item.status}
            payment={item.payment ? { id: item.payment.id, status: item.payment.status } : null}
            onChanged={onChanged}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-3.5" /> Sebelumnya
      </button>

      <p className="text-[12px] font-medium text-slate-400">
        Halaman <span className="text-slate-700">{page}</span> dari{" "}
        <span className="text-slate-700">{totalPages}</span>
      </p>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Berikutnya <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN VIEW
───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

export function OrdersView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [programId, setProgramId] = useState("");
  const [page, setPage] = useState(1);

  const utils = trpc.useUtils();

  const programOptionsQuery = trpc.orders.getOrderProgramOptions.useQuery();

  const ordersQuery = trpc.orders.getAll.useQuery(
    {
      programId: programId || undefined,
      search: search || undefined,
      status: (status || undefined) as
        | "pending_payment"
        | "paid"
        | "confirmed"
        | "cancelled"
        | "expired"
        | undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    },
    { placeholderData: (prev) => prev },
  );

  const data = ordersQuery.data;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }

  function refetch() {
    void utils.orders.getAll.invalidate();
  }

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Pesanan", icon: <ShoppingBag /> },
          ]}
          title="Manajemen Pesanan"
          description="Pantau dan kelola semua pendaftaran & pembayaran dari seluruh program."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10">
        {/* Summary */}
        <SummaryCards total={total} items={items} />

        {/* Filters */}
        <FilterBar
          search={search}
          onSearchChange={handleFilterChange(setSearch)}
          status={status}
          onStatusChange={handleFilterChange(setStatus)}
          programId={programId}
          onProgramChange={handleFilterChange(setProgramId)}
          programOptions={programOptionsQuery.data ?? []}
        />

        {/* List */}
        {ordersQuery.isLoading && !data ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-slate-400 shadow-sm">
            <Loader2 className="size-5 animate-spin" />
            <p className="text-[13px]">Memuat data pesanan…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
            <Inbox className="size-8 text-slate-300" />
            <div>
              <p className="text-[13px] font-semibold text-slate-500">
                Belum ada pesanan
              </p>
              <p className="mt-1 text-[12px] text-slate-400">
                {search || status || programId
                  ? "Tidak ada pesanan yang cocok dengan filter saat ini."
                  : "Pesanan akan muncul di sini setelah ada pendaftar dari salah satu program."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((item) => (
              <OrderRow key={item.id} item={item as OrderItem} onChanged={refetch} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}