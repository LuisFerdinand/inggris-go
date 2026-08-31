// app/(dashboard)/dashboard/projects/[projectId]/_modules/ProjectDetailView.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Trash2, Users } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS, PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/enums/enums";

import { ProjectStatusBadge } from "../../_modules/project-badges";
import { TaskBoardView } from "../../../tasks/_modules/TaskBoardView";
import { initials } from "../../../tasks/_modules/helpers";

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { data: session } = useSession();
  const confirm = useConfirm();
  const role = session?.user?.role;
  const canManage =
    role === "admin" || role === "super_admin" || role === "operational_manager";

  const router = useRouter();
  const utils = trpc.useUtils();
  const projectQuery = trpc.projects.getById.useQuery({ id: projectId });
  const project = projectQuery.data;

  const updateStatusMutation = trpc.projects.updateStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.projects.getById.invalidate({ id: projectId }),
        utils.projects.list.invalidate(),
      ]);
      toast.success("Status proyek diperbarui");
    },
    onError: (err) => toast.error(err.message || "Gagal mengubah status proyek"),
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: async () => {
      await utils.projects.list.invalidate();
      toast.success("Proyek berhasil dihapus");
      router.push("/dashboard/projects");
    },
    onError: (err) => toast.error(err.message || "Gagal menghapus proyek"),
  });

  if (projectQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-16 text-slate-300">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-[13px] font-semibold text-slate-500">Proyek tidak ditemukan</p>
        <Link href="/dashboard/projects" className="text-[12.5px] font-semibold text-indigo-600">
          Kembali ke daftar proyek
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 pt-4 pb-3 sm:px-6">
        <Link
          href="/dashboard/projects"
          className="inline-flex w-fit items-center gap-1 text-[11.5px] font-semibold text-slate-400 hover:text-indigo-600"
        >
          <ArrowLeft className="size-3.5" /> Semua Proyek
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
                {project.name}
              </h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="mt-1 max-w-xl text-[12.5px] text-slate-400">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {project.pic ? (
                <>
                  <Avatar size="sm">
                    <AvatarImage src={project.pic.image ?? undefined} />
                    <AvatarFallback className="text-[9px]">
                      {initials(project.pic.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[12px] text-slate-500">{project.pic.name}</span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-[12px] text-slate-300">
                  <Users className="size-3.5" /> Belum ada PIC
                </span>
              )}
            </div>

            {canManage && (
              <Select
                value={project.status}
                onValueChange={(v) =>
                  updateStatusMutation.mutate({ id: project.id, status: v as ProjectStatus })
                }
              >
                <SelectTrigger className="h-8 w-[140px] text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PROJECT_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {canManage && (
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={async () => {
                  if (
                    await confirm({
                      title: `Hapus proyek "${project.name}"?`,
                      description:
                        "Semua tugas di dalamnya akan ikut terhapus dan tindakan ini tidak dapat dibatalkan.",
                      confirmText: "Hapus Proyek",
                    })
                  ) {
                    deleteMutation.mutate({ id: project.id });
                  }
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <TaskBoardView
          projectId={project.id}
          title="Papan Tugas"
          subtitle="Tugas dalam proyek ini."
        />
      </div>
    </div>
  );
}
