// app/(dashboard)/dashboard/teaching/_modules/TeachingHomeView.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  Layers,
  ClipboardList,
  Globe2,
  MapPin,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { CLASS_STATUS_LABEL, CLASS_STATUS_META } from "@/lib/enums/enums";
import type { ClassStatus } from "@/lib/enums/enums";

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

function greetingForHour(hour: number) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function ClassStatusBadge({ status }: { status: ClassStatus }) {
  const meta = CLASS_STATUS_META[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold"
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

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: bg }}
      >
        <Icon className="size-5" style={{ color }} />
      </div>
      <div>
        <p className="text-[19px] font-extrabold leading-none text-slate-800">
          {value}
        </p>
        <p className="mt-1 text-[11.5px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BATCH CARD
───────────────────────────────────────────────────────────── */

type BatchWithProgram = {
  id: string;
  title: string;
  status: string;
  mode?: string | null;
  startDate: string | Date | null;
  program: { title: string } | null;
};

function BatchCard({
  batch,
  canCreateClass,
}: {
  batch: BatchWithProgram;
  canCreateClass: boolean;
}) {
  const studentsQuery = trpc.classes.getRegisteredStudents.useQuery({
    batchId: batch.id,
  });

  const students = studentsQuery.data ?? [];
  const unclassed = students.filter((s) => !s.alreadyRostered).length;
  const ModeIcon = batch.mode === "online" ? Globe2 : MapPin;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">
            {batch.program?.title ?? "Program"}
          </p>
          <h3 className="mt-0.5 truncate text-[14.5px] font-bold text-slate-800">
            {batch.title}
          </h3>
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
          <ModeIcon className="size-3.5 text-indigo-500" />
        </div>
      </div>

      {formatDate(batch.startDate) && (
        <p className="mt-0.5 text-[12px] text-slate-400">
          Mulai {formatDate(batch.startDate)}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-dashed border-slate-200 pt-3 text-[12px] text-slate-500">
        {studentsQuery.isLoading ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="size-3.5 animate-spin" /> Memuat…
          </span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-slate-400" />
              {students.length} terdaftar
            </span>
            {unclassed > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-600">
                <UserPlus className="size-3" />
                {unclassed} siap dikelaskan
              </span>
            )}
          </>
        )}
      </div>

      {canCreateClass && (
        <Link
          href={`/dashboard/teaching/classes/create?batchId=${batch.id}`}
          className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-[12.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          <Plus className="size-3.5" /> Buat Kelas
        </Link>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN VIEW
───────────────────────────────────────────────────────────── */

export function TeachingHomeView() {
  const { data: session } = useSession();
  const isOversight =
    session?.user?.role === "author" ||
    session?.user?.role === "admin" ||
    session?.user?.role === "super_admin";
  const batchesQuery = trpc.classes.listMyBatches.useQuery();
  const classesQuery = trpc.classes.listMine.useQuery(undefined);

  const batches = (batchesQuery.data ?? []) as BatchWithProgram[];
  const classes = classesQuery.data ?? [];

  const greeting = greetingForHour(new Date().getHours());
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const activeClassCount = classes.filter(
    (c) => c.status === "active" || c.status === "draft",
  ).length;

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-4 sm:px-6">
      {/* Hero greeting */}
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-6 sm:px-6"
        style={{
          background:
            "linear-gradient(140deg, #060f2e 0%, #0a2d87 55%, #1a52c8 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(247,181,0,0.18), transparent 65%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <GraduationCap className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-[17px] font-extrabold text-white sm:text-[19px]">
              {greeting}
              {firstName ? `, ${firstName}` : ""}!
            </h1>
            <p className="mt-0.5 text-[12.5px] text-white/60">
              Semangat mengajar hari ini — begini progres kelasmu.
            </p>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={Layers}
          label="Batch ditugaskan"
          value={batches.length}
          color="#4f46e5"
          bg="#e0e7ff"
        />
        <StatCard
          icon={ClipboardList}
          label="Kelas berjalan"
          value={activeClassCount}
          color="#0d9488"
          bg="#ccfbf1"
        />
        <StatCard
          icon={Sparkles}
          label="Total kelas dibuat"
          value={classes.length}
          color="#db2777"
          bg="#fce7f3"
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-slate-400" />
          <h2 className="text-[13.5px] font-bold text-slate-700">
            Batch Ditugaskan
          </h2>
        </div>

        {batchesQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-10 text-slate-400">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-[12.5px]">Memuat batch…</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Layers className="size-5 text-indigo-400" />
            </div>
            <p className="text-[12.5px] text-slate-500">
              Belum ada batch yang ditugaskan padamu.
            </p>
            <p className="text-[11.5px] text-slate-400">
              Hubungi admin untuk mulai mengajar sebuah batch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                canCreateClass={isOversight}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-slate-400" />
            <h2 className="text-[13.5px] font-bold text-slate-700">
              Kelas Saya
            </h2>
          </div>
          <Link
            href="/dashboard/teaching/classes"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Lihat semua <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {classesQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-10 text-slate-400">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-[12.5px]">Memuat kelas…</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center text-[12.5px] text-slate-400">
            Belum ada kelas yang dibuat.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {classes.slice(0, 5).map((row) => {
              const meta = CLASS_STATUS_META[row.status as ClassStatus];

              return (
                <Link
                  key={row.id}
                  href={`/dashboard/teaching/classes/${row.id}`}
                  className={cn(
                    "relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-4",
                    "transition-colors hover:border-indigo-200 hover:bg-indigo-50/40",
                  )}
                >
                  <div
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ background: meta.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-800">
                      {row.title}
                    </p>
                    <p className="truncate text-[11.5px] text-slate-400">
                      {row.program?.title} · {row.roster?.length ?? 0} siswa
                    </p>
                  </div>
                  <ClassStatusBadge status={row.status as ClassStatus} />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
