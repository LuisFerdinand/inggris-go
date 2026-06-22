// app/(dashboard)/dashboard/program-saya/_modules/MyProgramsView.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  MapPin,
  Wallet,
  ExternalLink,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PackageSearch,
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
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────────────────────────
   STATUS META
───────────────────────────────────────────────────────────── */

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending_payment: {
    label: "Menunggu Pembayaran",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  paid: {
    label: "Lunas",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  confirmed: {
    label: "Terkonfirmasi",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-500 border-slate-200",
    icon: XCircle,
  },
  expired: {
    label: "Kedaluwarsa",
    className: "bg-red-50 text-red-600 border-red-200",
    icon: AlertCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-500 border-slate-200",
    icon: AlertCircle,
  };
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        meta.className,
      )}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   STATUS FILTER PILLS
───────────────────────────────────────────────────────────── */

const FILTER_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "pending_payment", label: "Menunggu Bayar" },
  { value: "paid", label: "Lunas" },
  { value: "confirmed", label: "Terkonfirmasi" },
] as const;

function FilterPills({
  active,
  onChange,
}: {
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
              isActive
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ORDER CARD — mobile-first
───────────────────────────────────────────────────────────── */

type MyOrderItem = {
  id: string;
  type: string;
  status: string;
  customerName: string;
  childName: string | null;
  program: {
    id: string;
    title: string | null;
    slug: string | null;
    categorySlug: string | null;
    format: string | null;
    level: string | null;
  };
  batch: {
    id: string | null;
    title: string;
    startDate: string | null;
    mode: string | null;
    location: string | null;
  } | null;
  package: {
    title: string | null;
  };
  pricing: {
    final: number;
    discount: number;
  };
  payment: {
    status: string;
    invoiceNumber: string;
    paymentUrl: string | null;
  } | null;
  createdAt: string | Date;
};

function OrderCard({ item }: { item: MyOrderItem }) {
  const needsPayment =
    item.status === "pending_payment" &&
    item.payment?.status === "pending" &&
    !!item.payment.paymentUrl;

  const programHref =
    item.program.categorySlug && item.program.slug
      ? `/programs/${item.program.categorySlug}/${item.program.slug}`
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Top accent */}
      <div
        className={cn(
          "h-1 w-full",
          item.status === "paid" || item.status === "confirmed"
            ? "bg-emerald-400"
            : item.status === "pending_payment"
              ? "bg-amber-400"
              : "bg-slate-300",
        )}
      />

      <div className="p-4">
        {/* Header: title + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Sparkles className="size-3" />
              <span>
                {formatDate(item.createdAt) ?? "Baru saja"}
              </span>
            </div>
            <h3 className="truncate text-[14px] font-bold leading-snug text-slate-800">
              {item.program.title ?? "Program"}
            </h3>
            <p className="mt-0.5 truncate text-[12px] text-slate-500">
              {item.package.title ?? "Paket"}
              {item.childName ? ` • untuk ${item.childName}` : ""}
            </p>
          </div>

          <div className="shrink-0">
            <StatusBadge status={item.status} />
          </div>
        </div>

        {/* Batch info (if scheduled) */}
        {item.batch && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl bg-slate-50/80 px-3 py-2.5 text-[12px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 text-slate-400" />
              {item.batch.title}
              {formatDate(item.batch.startDate)
                ? ` • ${formatDate(item.batch.startDate)}`
                : ""}
            </span>
            {item.batch.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-slate-400" />
                {item.batch.location}
              </span>
            )}
          </div>
        )}

        {/* Price row */}
        <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <Wallet className="size-3.5" />
            Total
          </div>
          <div className="text-right">
            <p className="text-[15px] font-bold text-slate-800">
              {formatIDR(item.pricing.final)}
            </p>
            {item.pricing.discount > 0 && (
              <p className="text-[10.5px] font-medium text-emerald-600">
                Hemat {formatIDR(item.pricing.discount)}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
          {needsPayment && (
            <a
              href={item.payment!.paymentUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
            >
              Lanjutkan Pembayaran <ExternalLink className="size-3.5" />
            </a>
          )}

          {programHref && (
            <Link
              href={programHref}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-[12.5px] font-semibold transition-colors",
                needsPayment
                  ? "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  : "border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-50",
              )}
            >
              Lihat Program <ChevronRight className="size-3.5" />
            </Link>
          )}
        </div>

        {item.payment && (
          <p className="mt-2.5 text-center text-[10.5px] text-slate-300">
            No. Invoice: {item.payment.invoiceNumber}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
        <PackageSearch className="size-6" />
      </div>
      <div>
        <p className="text-[14px] font-bold text-slate-700">
          Belum ada program yang diikuti
        </p>
        <p className="mx-auto mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-slate-400">
          Jelajahi program yang tersedia dan mulai perjalanan belajarmu
          sekarang.
        </p>
      </div>
      <Link
        href="/programs"
        className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
      >
        <BookOpen className="size-4" />
        Jelajahi Program
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGINATION (simple prev/next, mobile-friendly)
───────────────────────────────────────────────────────────── */

function Pager({
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
    <div className="flex items-center justify-between gap-3 pt-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-3.5" /> Sebelumnya
      </button>

      <p className="text-[11.5px] font-medium text-slate-400">
        {page} / {totalPages}
      </p>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Berikutnya <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUMMARY STRIP (compact, mobile-friendly)
───────────────────────────────────────────────────────────── */

function SummaryStrip({ items }: { items: MyOrderItem[] }) {
  const active = items.filter(
    (i) => i.status === "paid" || i.status === "confirmed",
  ).length;
  const pending = items.filter((i) => i.status === "pending_payment").length;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
        <p className="text-[10.5px] font-medium text-slate-400">
          Total Program
        </p>
        <p className="mt-0.5 text-[18px] font-bold text-slate-800">
          {items.length}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
        <p className="text-[10.5px] font-medium text-slate-400">Aktif</p>
        <p className="mt-0.5 text-[18px] font-bold text-emerald-600">
          {active}
        </p>
      </div>
      <div className="col-span-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 sm:col-span-1">
        <p className="text-[10.5px] font-medium text-slate-400">
          Menunggu Bayar
        </p>
        <p className="mt-0.5 text-[18px] font-bold text-amber-600">
          {pending}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN VIEW
───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 8;

export function MyProgramsView() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const ordersQuery = trpc.orders.getMyOrders.useQuery(
    {
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
  const items = (data?.items ?? []) as MyOrderItem[];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleStatusChange(v: string) {
    setStatus(v);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
          Program Saya
        </h1>
        <p className="mt-0.5 text-[12.5px] text-slate-400">
          Pantau status pendaftaran dan pembayaran programmu di sini.
        </p>
      </div>

      {/* Loading */}
      {ordersQuery.isLoading && !data ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
          <Loader2 className="size-5 animate-spin" />
          <p className="text-[12.5px]">Memuat program kamu…</p>
        </div>
      ) : items.length === 0 && !status ? (
        <EmptyState />
      ) : (
        <>
          <SummaryStrip items={items} />

          <FilterPills active={status} onChange={handleStatusChange} />

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center">
              <AlertCircle className="size-6 text-slate-300" />
              <p className="text-[12.5px] text-slate-400">
                Tidak ada program dengan status ini.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <OrderCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <Pager page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}