// app/(dashboard)/dashboard/teaching/classes/persetujuan/_modules/ScoreApprovalView.tsx
"use client";

import Link from "next/link";
import { CalendarClock, ShieldCheck } from "lucide-react";

import { trpc } from "@/lib/trpc/client";

function formatShortDate(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ScoreApprovalView() {
  const pendingQuery = trpc.classScores.listPendingReview.useQuery();
  const pending = pendingQuery.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 px-4 pb-6 pt-4 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
          <ShieldCheck className="size-5 text-indigo-600" />
          Persetujuan Nilai
        </h1>
        <p className="mt-0.5 text-[12.5px] text-slate-400">
          Nilai yang diajukan guru dan menunggu persetujuan author, admin, atau super admin.
        </p>
      </div>

      {pendingQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
          <span className="text-[12.5px]">Memuat nilai…</span>
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center text-[12.5px] text-slate-400">
          Tidak ada nilai yang menunggu persetujuan.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {pending.map((item) => {
              const submittedLabel = formatShortDate(item.submittedAt);

              return (
                <Link
                  key={item.classEnrollmentId}
                  href={`/dashboard/teaching/classes/${item.classId}?tab=scores`}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-800">
                      {item.studentName}
                    </p>
                    <p className="truncate text-[11.5px] text-slate-400">
                      {item.classTitle} · {item.programTitle}
                    </p>
                  </div>

                  <div className="flex w-24 shrink-0 items-center gap-1 text-[11px] text-slate-400">
                    {submittedLabel && (
                      <>
                        <CalendarClock className="size-3" />
                        {submittedLabel}
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
