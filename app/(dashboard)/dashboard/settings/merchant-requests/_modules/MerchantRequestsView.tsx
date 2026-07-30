// app/(dashboard)/dashboard/settings/merchant-requests/_modules/MerchantRequestsView.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";
import type { MerchantRegistration } from "@/app/db/schema/payment-settings";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

type RegistrationListItem = MerchantRegistration & {
  account: { id: string; name: string; email: string; image: string | null } | null;
};

const STATUS_META = {
  pending: {
    label: "Menunggu",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
} as const;

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "all", label: "Semua" },
];

function RegistrationCard({
  registration,
  onReview,
  isReviewing,
}: {
  registration: RegistrationListItem;
  onReview: (id: string, status: "approved" | "rejected", note?: string) => void;
  isReviewing: boolean;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const meta = STATUS_META[registration.status];
  const StatusIcon = meta.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-black text-slate-900">
              {registration.businessName}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-black",
                meta.className,
              )}
            >
              <StatusIcon className="size-3" />
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {registration.ownerName} · {registration.account?.email ?? registration.email}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-2 text-[12px] sm:grid-cols-2">
        <p className="text-slate-500">
          Telepon: <span className="font-semibold text-slate-700">{registration.phone}</span>
        </p>
        <p className="text-slate-500">
          Kategori:{" "}
          <span className="font-semibold text-slate-700">
            {registration.businessCategory || "-"}
          </span>
        </p>
        <p className="text-slate-500">
          Bank: <span className="font-semibold text-slate-700">{registration.bankName}</span>
        </p>
        <p className="text-slate-500">
          No. Rekening:{" "}
          <span className="font-semibold text-slate-700">
            {registration.bankAccountNumber} a.n. {registration.bankAccountName}
          </span>
        </p>
      </div>

      {registration.description && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-[12px] text-slate-600">
          {registration.description}
        </p>
      )}

      {registration.reviewNote && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-[12px] text-red-700">
          Catatan: {registration.reviewNote}
        </p>
      )}

      {registration.status === "pending" && (
        <div className="mt-4 flex flex-col gap-2">
          {noteOpen && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Alasan penolakan (opsional)"
              rows={2}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-medium text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isReviewing}
              onClick={() => onReview(registration.id, "approved")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[12px] font-black text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckCircle2 className="size-3.5" />
              Setujui
            </button>
            {noteOpen ? (
              <button
                type="button"
                disabled={isReviewing}
                onClick={() => onReview(registration.id, "rejected", note)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-[12px] font-black text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                <XCircle className="size-3.5" />
                Konfirmasi Tolak
              </button>
            ) : (
              <button
                type="button"
                disabled={isReviewing}
                onClick={() => setNoteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-[12px] font-black text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
              >
                <XCircle className="size-3.5" />
                Tolak
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MerchantRequestsView() {
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<StatusFilter>("pending");

  const listQuery = trpc.merchant.listRegistrations.useQuery({
    status: tab === "all" ? undefined : tab,
    limit: 50,
    offset: 0,
  });

  const review = trpc.merchant.reviewRegistration.useMutation({
    onSuccess: () => {
      toast.success("Status merchant diperbarui!");
      void utils.merchant.listRegistrations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui status merchant");
    },
  });

  function handleReview(id: string, status: "approved" | "rejected", note?: string) {
    review.mutate({ id, status, reviewNote: note });
  }

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Bisnis", href: "/dashboard" },
            { label: "Permintaan Merchant", icon: <ClipboardCheck /> },
          ]}
          title="Permintaan Merchant"
          description="Tinjau dan setujui pendaftaran merchant dari pengguna."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
        <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "shrink-0 rounded-xl px-3.5 py-2 text-[12px] font-black transition-colors",
                tab === t.value
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:bg-slate-50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {listQuery.isLoading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="size-7 animate-spin" />
              <p className="text-[13px] font-black">Memuat data…</p>
            </div>
          </div>
        )}

        {listQuery.isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50">
            <AlertCircle className="size-7 text-red-500" />
            <p className="text-[13px] font-black text-red-700">Gagal memuat data</p>
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-[12px] font-black text-white hover:bg-red-700"
            >
              <RefreshCcw className="size-3.5" />
              Coba Lagi
            </button>
          </div>
        )}

        {listQuery.data && listQuery.data.length === 0 && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white text-slate-400 shadow-sm">
            <ClipboardCheck className="size-7" />
            <p className="text-[13px] font-black">Tidak ada permintaan</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {listQuery.data?.map((registration) => (
            <RegistrationCard
              key={registration.id}
              registration={registration}
              onReview={handleReview}
              isReviewing={review.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
