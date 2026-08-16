// app/(dashboard)/dashboard/projects/_modules/ProjectsListView.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FolderKanban, Loader2, Plus, Users } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PROJECT_STATUS, PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/enums/enums";

import { ProjectStatusBadge } from "./project-badges";
import { CreateProjectSheet } from "./CreateProjectSheet";
import { initials } from "../../tasks/_modules/helpers";

type StatusFilter = "all" | ProjectStatus;

export function ProjectsListView() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const canManage = role === "admin" || role === "super_admin";

  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [createOpen, setCreateOpen] = useState(() => searchParams.get("create") === "1");

  const projectsQuery = trpc.projects.list.useQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
  );
  const projects = projectsQuery.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 px-4 pb-6 pt-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
            <FolderKanban className="size-5 text-indigo-600" />
            Proyek
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-400">
            Kelola proyek tim — setiap tugas dikerjakan di dalam sebuah proyek.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-3.5" /> Buat Proyek
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {(["all", ...PROJECT_STATUS] as StatusFilter[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              "inline-flex h-8 items-center rounded-lg border px-3 text-[12px] font-semibold transition-colors",
              statusFilter === status
                ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
            )}
          >
            {status === "all" ? "Semua" : PROJECT_STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      {projectsQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-[12.5px]">Memuat proyek…</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center text-[12.5px] text-slate-400">
          Belum ada proyek{statusFilter !== "all" ? ` dengan status ini` : ""}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const progress =
              project.taskCount > 0
                ? Math.round((project.doneTaskCount / project.taskCount) * 100)
                : 0;

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-[14px] font-bold text-slate-800">
                    {project.name}
                  </p>
                  <ProjectStatusBadge status={project.status} />
                </div>

                {project.description && (
                  <p className="line-clamp-2 text-[12px] text-slate-400">{project.description}</p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    {project.pic ? (
                      <>
                        <Avatar size="sm">
                          <AvatarImage src={project.pic.image ?? undefined} />
                          <AvatarFallback className="text-[9px]">
                            {initials(project.pic.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-[11px] text-slate-400">
                          {project.pic.name}
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                        <Users className="size-3" /> Belum ada PIC
                      </span>
                    )}
                  </div>

                  <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                    {project.doneTaskCount}/{project.taskCount} tugas
                  </span>
                </div>

                {project.taskCount > 0 && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {canManage && <CreateProjectSheet open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  );
}
