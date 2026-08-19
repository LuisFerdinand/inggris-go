// app/(dashboard)/dashboard/teaching/classes/[classId]/_modules/ClassDetailView.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASS_STATUS_LABEL, CLASS_STATUS_META } from "@/lib/enums/enums";
import type { ClassStatus } from "@/lib/enums/enums";
import { classDetailRegistry } from "@/lib/dashboard/tabs/classes";

const OVERSIGHT_ROLES = new Set([
  "author",
  "operational_manager",
  "admin",
  "super_admin",
]);

import { RosterTab } from "./tabs/RosterTab";
import { SessionsTab } from "./tabs/SessionsTab";
import { ScoresTab } from "./tabs/ScoresTab";
import { ReportsTab } from "./tabs/ReportsTab";

function ClassStatusBadge({ status }: { status: ClassStatus }) {
  const meta = CLASS_STATUS_META[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
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

export function ClassDetailView({ classId }: { classId: string }) {
  const searchParams = useSearchParams();
  const preselectedTab = searchParams.get("tab");
  const [tab, setTab] = useState<string>(
    preselectedTab ?? classDetailRegistry.defaultTab,
  );

  const { data: session } = useSession();
  const isOversight = OVERSIGHT_ROLES.has(session?.user?.role ?? "");

  const classQuery = trpc.classes.getById.useQuery({ id: classId });
  const teachersQuery = trpc.classes.listAssignableTeachers.useQuery(
    undefined,
    { enabled: isOversight },
  );
  const utils = trpc.useUtils();

  const finishMutation = trpc.classes.finish.useMutation({
    onSuccess: async () => {
      await utils.classes.getById.invalidate({ id: classId });
      toast.success("Kelas diselesaikan. Penilaian sekarang dapat diisi.");
    },
    onError: (err) => toast.error(err.message || "Gagal menyelesaikan kelas"),
  });

  const reassignMutation = trpc.classes.update.useMutation({
    onSuccess: async () => {
      await utils.classes.getById.invalidate({ id: classId });
      toast.success("Guru kelas berhasil diubah");
    },
    onError: (err) => toast.error(err.message || "Gagal mengubah guru kelas"),
  });

  if (classQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-[13px]">Memuat kelas…</span>
      </div>
    );
  }

  const data = classQuery.data;

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-center text-slate-400">
        <p className="text-[13px]">Kelas tidak ditemukan.</p>
        <Link
          href="/dashboard/teaching/classes"
          className="text-[12.5px] font-semibold text-indigo-600"
        >
          Kembali ke daftar kelas
        </Link>
      </div>
    );
  }

  const canFinish = data.status === "draft" || data.status === "active";

  return (
    <div className="flex flex-col gap-5 px-4 pb-16 pt-4 sm:px-6">
      <div>
        <Link
          href="/dashboard/teaching/classes"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600"
        >
          <ArrowLeft className="size-3.5" /> Kelas
        </Link>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
              <GraduationCap className="size-5 text-indigo-600" />
              {data.title}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-slate-400">
              {data.program?.title} · {data.batch?.title}
              {data.periodLabel ? ` · ${data.periodLabel}` : ""}
              {!isOversight && data.teacher ? ` · ${data.teacher.name}` : ""}
            </p>

            {isOversight && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11.5px] font-semibold text-slate-500">
                  Guru:
                </span>
                <Select
                  value={data.teacherId}
                  onValueChange={(teacherId) =>
                    reassignMutation.mutate({ id: classId, teacherId })
                  }
                >
                  <SelectTrigger className="h-8 w-48 text-[12px]">
                    <SelectValue placeholder="Pilih guru" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.teacher && (
                      <SelectItem value={data.teacher.id}>
                        {data.teacher.name}
                      </SelectItem>
                    )}
                    {teachersQuery.data
                      ?.filter((t) => t.id !== data.teacher?.id)
                      .map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {reassignMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin text-slate-400" />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ClassStatusBadge status={data.status as ClassStatus} />
            {canFinish && (
              <button
                type="button"
                disabled={finishMutation.isPending}
                onClick={() => finishMutation.mutate({ id: classId })}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[12.5px] font-bold text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {finishMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Selesaikan Kelas
              </button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="w-full justify-start">
          {classDetailRegistry.tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="roster" className="pt-4">
          <RosterTab classId={classId} batchId={data.batchId} roster={data.roster ?? []} />
        </TabsContent>

        <TabsContent value="sessions" className="pt-4">
          <SessionsTab classId={classId} />
        </TabsContent>

        <TabsContent value="scores" className="pt-4">
          <ScoresTab
            classId={classId}
            classStatus={data.status as ClassStatus}
            roster={data.roster ?? []}
          />
        </TabsContent>

        <TabsContent value="reports" className="pt-4">
          <ReportsTab classId={classId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
