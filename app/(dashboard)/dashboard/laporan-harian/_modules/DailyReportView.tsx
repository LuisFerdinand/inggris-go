// app/(dashboard)/dashboard/laporan-harian/_modules/DailyReportView.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2, NotebookPen, Save, Users } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";

function todayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function MySection() {
  const utils = trpc.useUtils();
  const myReportQuery = trpc.dailyReports.getMine.useQuery();
  const [content, setContent] = useState("");

  useEffect(() => {
    const report = myReportQuery.data;
    if (!report) return;
    setContent(report.content);
  }, [myReportQuery.data]);

  const submit = trpc.dailyReports.submit.useMutation({
    onSuccess: () => {
      toast.success("Laporan harian berhasil dikirim");
      void utils.dailyReports.getMine.invalidate();
      void utils.dailyReports.listToday.invalidate();
    },
    onError: (err) => toast.error(err.message || "Gagal mengirim laporan"),
  });

  const alreadySubmitted = !!myReportQuery.data;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <NotebookPen className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-black text-slate-900">
            Laporan Harian — {todayLabel()}
          </h2>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
            Ceritakan progres, hambatan, atau hal lain yang ingin kamu laporkan hari ini.
          </p>
        </div>
      </div>

      <div className="p-5">
        {myReportQuery.isLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <>
            {alreadySubmitted && (
              <div className="mb-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0" />
                <p className="text-[12.5px] font-semibold">
                  Kamu sudah mengisi laporan hari ini. Kamu masih bisa mengubahnya di bawah.
                </p>
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Tulis laporan harianmu di sini…"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />

            <button
              type="button"
              disabled={submit.isPending || !content.trim()}
              onClick={() => submit.mutate({ content: content.trim() })}
              className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-[13px] font-black text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submit.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {alreadySubmitted ? "Perbarui Laporan" : "Kirim Laporan"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function TeamTodaySection() {
  const query = trpc.dailyReports.listToday.useQuery();
  const members = query.data ?? [];
  const submittedCount = members.filter((m) => m.submitted).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <Users className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-black text-slate-900">Ringkasan Tim Hari Ini</h2>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
            {query.isLoading
              ? "Memuat…"
              : `${submittedCount} dari ${members.length} anggota sudah mengisi laporan.`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-5">
        {query.isLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-100 p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600">
                  {initials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-bold text-slate-700">
                    {member.name}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold",
                    member.submitted
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {member.submitted ? "Sudah mengisi" : "Belum mengisi"}
                </span>
              </div>
              {member.submitted && member.content && (
                <p className="mt-2 whitespace-pre-wrap text-[12px] text-slate-500">
                  {member.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function DailyReportView() {
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "super_admin";

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Laporan Harian", icon: <NotebookPen /> },
          ]}
          title="Laporan Harian"
          description="Laporan singkat harian untuk seluruh anggota yang mendapat tugas."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
        <MySection />
        {isAdmin && <TeamTodaySection />}
      </div>
    </div>
  );
}
