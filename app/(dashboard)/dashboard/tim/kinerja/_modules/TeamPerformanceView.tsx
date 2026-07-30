// app/(dashboard)/dashboard/tim/kinerja/_modules/TeamPerformanceView.tsx
"use client";

import { Gauge, Loader2 } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function scoreClassName(score: number) {
  if (score >= 4) return "bg-emerald-50 text-emerald-700";
  if (score >= 2.5) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

export function TeamPerformanceView() {
  const query = trpc.taskBoard.teamPerformance.useQuery();
  const members = query.data ?? [];

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Kinerja Tim", icon: <Gauge /> },
          ]}
          title="Kinerja Tim"
          description="Ringkasan sederhana ketepatan waktu dan beban tugas setiap anggota tim."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10">
        {query.isLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-slate-400 shadow-sm">
            <Loader2 className="size-5 animate-spin" />
            <p className="text-[13px] font-semibold">Memuat data kinerja…</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
            <p className="text-[13px] font-black text-slate-600">
              Belum ada anggota tim untuk ditampilkan
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-center">Tugas Aktif</TableHead>
                  <TableHead className="text-center">Selesai</TableHead>
                  <TableHead className="text-center">Terlambat</TableHead>
                  <TableHead className="text-center">Ditolak</TableHead>
                  <TableHead className="text-center">Skor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600">
                          {initials(member.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-slate-700">
                            {member.name}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-[13px] text-slate-600">
                      {member.active}
                    </TableCell>
                    <TableCell className="text-center text-[13px] text-slate-600">
                      {member.done}
                    </TableCell>
                    <TableCell className="text-center text-[13px]">
                      {member.overdue > 0 ? (
                        <span className="font-bold text-red-500">{member.overdue}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-[13px] text-slate-600">
                      {member.rejected}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[12px] font-bold",
                          scoreClassName(member.score),
                        )}
                      >
                        {member.score.toFixed(1)}/5
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-[11px] text-slate-400">
          Skor adalah alat bantu evaluasi berdasarkan ketepatan waktu dan jumlah tugas
          yang ditolak — bukan satu-satunya dasar penilaian.
        </p>
      </div>
    </div>
  );
}
