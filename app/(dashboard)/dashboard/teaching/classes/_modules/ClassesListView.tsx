// app/(dashboard)/dashboard/teaching/classes/_modules/ClassesListView.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ClipboardList, Loader2, Plus, Users } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASS_STATUS_LABEL, CLASS_STATUS_META } from "@/lib/enums/enums";
import type { ClassStatus } from "@/lib/enums/enums";

function ClassStatusBadge({ status }: { status: ClassStatus }) {
  const meta = CLASS_STATUS_META[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap"
      style={{
        borderColor: `${meta.color}33`,
        background: `${meta.color}14`,
        color: meta.color,
      }}
    >
      {CLASS_STATUS_LABEL[status]}
    </span>
  );
}

export function ClassesListView() {
  const { data: session } = useSession();
  const isOversight =
    session?.user?.role === "author" ||
    session?.user?.role === "admin" ||
    session?.user?.role === "super_admin";

  const [teacherId, setTeacherId] = useState<string>("");

  const teacherOptionsQuery = trpc.classes.listTeacherFilterOptions.useQuery(
    undefined,
    { enabled: isOversight },
  );

  const classesQuery = trpc.classes.listMine.useQuery({
    teacherId: teacherId || undefined,
  });

  const classes = classesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
            <ClipboardList className="size-5 text-indigo-600" />
            {isOversight ? "Semua Kelas" : "Kelas Saya"}
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-400">
            {isOversight
              ? "Pantau seluruh kelas yang dibuat oleh setiap pengajar."
              : "Kelola kelas yang kamu buat dari batch yang ditugaskan."}
          </p>
        </div>

        {isOversight && (
          <Link
            href="/dashboard/teaching/classes/create"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-3.5" /> Buat Kelas Baru
          </Link>
        )}
      </div>

      {isOversight && (teacherOptionsQuery.data?.length ?? 0) > 0 && (
        <div className="w-full max-w-xs">
          <Select
            value={teacherId || "all"}
            onValueChange={(v) => setTeacherId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-9 text-[12.5px]">
              <SelectValue placeholder="Semua pengajar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua pengajar</SelectItem>
              {teacherOptionsQuery.data?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {classesQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-[12.5px]">Memuat kelas…</span>
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center text-[12.5px] text-slate-400">
          Belum ada kelas.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {classes.map((row) => (
            <Link
              key={row.id}
              href={`/dashboard/teaching/classes/${row.id}`}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm",
                "transition-colors hover:border-indigo-200 hover:bg-indigo-50/30",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-slate-800">
                  {row.title}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-slate-400">
                  {row.program?.title}
                  {row.periodLabel ? ` · ${row.periodLabel}` : ""}
                  {isOversight && row.teacher ? ` · ${row.teacher.name}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                  <Users className="size-3.5 text-slate-400" />
                  {row.roster?.length ?? 0}
                </span>
                <ClassStatusBadge status={row.status as ClassStatus} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
