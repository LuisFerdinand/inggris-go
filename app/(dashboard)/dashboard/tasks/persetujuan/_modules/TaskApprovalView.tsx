// app/(dashboard)/dashboard/tasks/persetujuan/_modules/TaskApprovalView.tsx
"use client";

import { useState } from "react";
import { CalendarClock, MessageCircle, Plus, ShieldCheck } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { TaskPriorityBadge } from "../../_modules/badges";
import { formatShortDate, initials } from "../../_modules/helpers";
import { CreateTaskSheet } from "../../_modules/CreateTaskSheet";
import { TaskDetailSheet } from "../../_modules/TaskDetailSheet";

export function TaskApprovalView() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasksQuery = trpc.taskBoard.list.useQuery({ status: "pending_review" });
  const tasks = tasksQuery.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 px-4 pb-6 pt-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
            <ShieldCheck className="size-5 text-indigo-600" />
            Persetujuan Tugas
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-400">
            Semua tugas baru yang belum disetujui — dapat disetujui oleh admin atau super admin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          <Plus className="size-3.5" /> Tugas Baru
        </button>
      </div>

      {tasksQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
          <span className="text-[12.5px]">Memuat tugas…</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center text-[12.5px] text-slate-400">
          Tidak ada tugas yang menunggu persetujuan.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const dueLabel = formatShortDate(task.dueDate);

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800">
                    {task.title}
                  </p>

                  <div className="w-24 shrink-0">
                    <TaskPriorityBadge priority={task.priority} />
                  </div>

                  <div className="flex w-40 shrink-0 items-center gap-1.5">
                    <Avatar size="sm">
                      <AvatarImage src={task.creator?.image ?? undefined} />
                      <AvatarFallback className="text-[9px]">
                        {initials(task.creator?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-[11px] text-slate-400">
                      {task.creator?.name ?? "—"}
                    </span>
                  </div>

                  <div className="flex w-20 shrink-0 items-center gap-1 text-[11px] text-slate-400">
                    {dueLabel && (
                      <>
                        <CalendarClock className="size-3" />
                        {dueLabel}
                      </>
                    )}
                  </div>

                  <div className="flex w-10 shrink-0 items-center justify-end gap-1 text-[11px] text-slate-400">
                    {task.commentCount > 0 && (
                      <>
                        <MessageCircle className="size-3" />
                        {task.commentCount}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <CreateTaskSheet open={createOpen} onOpenChange={setCreateOpen} />
      <TaskDetailSheet
        taskId={selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />
    </div>
  );
}
