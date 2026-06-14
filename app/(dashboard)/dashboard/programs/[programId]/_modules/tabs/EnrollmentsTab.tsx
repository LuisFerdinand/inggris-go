// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/EnrollmentsTab.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Users,
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
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

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
   STATUS BADGES
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

const ENROLLMENT_STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending_payment", label: "Menunggu Bayar" },
  { value: "paid", label: "Lunas" },
  { value: "confirmed", label: "Terkonfirmasi" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "expired", label: "Kedaluwarsa" },
];

function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  batchId,
  onBatchChange,
  batchOptions,
  isScheduled,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  batchId: string;
  onBatchChange: (v: string) => void;
  batchOptions: { id: string; title: string }[];
  isScheduled: boolean;
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

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="size-3.5" />
        </div>

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

        {isScheduled && (
          <select
            value={batchId}
            onChange={(e) => onBatchChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Semua Batch</option>
            {batchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        )}
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
      label: "Total Pendaftar",
      value: total.toLocaleString("id-ID"),
      icon: Users,
      tint: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Sudah Bayar / Terkonfirmasi",
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
   ROW / CARD — one enrollment
───────────────────────────────────────────────────────────── */

type EnrollmentItem = {
  id: string;
  type: string;
  status: string;
  customerName: string;
  phone: string;
  email: string | null;
  childName: string | null;
  age: number | null;
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

function EnrollmentRow({ item }: { item: EnrollmentItem }) {
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

      {/* Batch + package */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:px-2">
        {item.batch ? (
          <>
            <p className="truncate text-[12px] font-semibold text-slate-700">
              {item.batch.title}
            </p>
            <p className="text-[11px] text-slate-400">
              {formatDate(item.batch.startDate)}
              {item.batch.mode ? ` • ${item.batch.mode}` : ""}
            </p>
          </>
        ) : (
          <p className="text-[12px] text-slate-400">Tanpa batch (kelas reguler)</p>
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
   MAIN TAB
───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

export default function EnrollmentsTab({ programId }: { programId: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [batchId, setBatchId] = useState("");
  const [page, setPage] = useState(1);

  const headerQuery = trpc.programs.getHeader.useQuery(
    { id: programId },
    { staleTime: 60_000 },
  );
  const isScheduled = headerQuery.data?.scheduleType === "scheduled";

  const batchOptionsQuery = trpc.orders.getProgramBatchOptions.useQuery(
    { programId },
    { enabled: isScheduled, staleTime: 60_000 },
  );

  const enrollmentsQuery = trpc.orders.getEnrollmentsByProgram.useQuery(
    {
      programId,
      search: search || undefined,
      status: (status || undefined) as
        | "pending_payment"
        | "paid"
        | "confirmed"
        | "cancelled"
        | "expired"
        | undefined,
      batchId: batchId || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    },
    { placeholderData: (prev) => prev },
  );

  const data = enrollmentsQuery.data;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
          <Users className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Pendaftar Program</h2>
          <p className="mt-0.5 text-[12px] text-slate-400">
            Daftar peserta yang sudah mendaftar melalui formulir pendaftaran online.
          </p>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards total={total} items={items} />

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={handleFilterChange(setSearch)}
        status={status}
        onStatusChange={handleFilterChange(setStatus)}
        batchId={batchId}
        onBatchChange={handleFilterChange(setBatchId)}
        batchOptions={batchOptionsQuery.data ?? []}
        isScheduled={isScheduled}
      />

      {/* List */}
      {enrollmentsQuery.isLoading && !data ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-slate-400 shadow-sm">
          <Loader2 className="size-5 animate-spin" />
          <p className="text-[13px]">Memuat data pendaftar…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
          <Inbox className="size-8 text-slate-300" />
          <div>
            <p className="text-[13px] font-semibold text-slate-500">
              Belum ada pendaftar
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              {search || status || batchId
                ? "Tidak ada pendaftar yang cocok dengan filter saat ini."
                : "Pendaftar akan muncul di sini setelah ada yang mengisi formulir pendaftaran."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <EnrollmentRow key={item.id} item={item as EnrollmentItem} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}