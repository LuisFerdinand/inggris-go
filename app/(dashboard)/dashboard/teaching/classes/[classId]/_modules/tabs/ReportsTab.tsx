// .../[classId]/_modules/tabs/ReportsTab.tsx
"use client";

import { FileDown, FileStack, Loader2 } from "lucide-react";

import { trpc } from "@/lib/trpc/client";

export function ReportsTab({ classId }: { classId: string }) {
  const scoresQuery = trpc.classScores.listByClass.useQuery({ classId });

  const rows = scoresQuery.data ?? [];
  const finalized = rows.filter((row) => row.score?.finalizedAt);

  if (scoresQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-[12.5px]">Memuat laporan…</span>
      </div>
    );
  }

  if (finalized.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
        <FileDown className="size-6 text-slate-300" />
        <p className="text-[13px] font-semibold text-slate-600">
          Belum ada laporan yang difinalisasi
        </p>
        <p className="max-w-xs text-[12px] text-slate-400">
          Finalisasi nilai siswa di tab Penilaian untuk membuat laporan PDF.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <a
        href={`/api/reports/class/${classId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
      >
        <FileStack className="size-3.5" /> Unduh Semua ({finalized.length})
      </a>

      <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {finalized.map((row) => (
          <div
            key={row.classEnrollmentId}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-slate-800">
                {row.studentName}
              </p>
              <p className="text-[11.5px] text-slate-400">
                {row.average?.toFixed(1)} / 5.0 — {row.progressLabel}
              </p>
            </div>

            <a
              href={`/api/reports/student-score/${row.score!.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-[11.5px] font-bold text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              <FileDown className="size-3.5" /> Unduh PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
