// app/(dashboard)/dashboard/tasks/_modules/TaskListView.tsx
"use client";

import { CalendarClock, MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TASK_STATUS_META } from "@/lib/enums/enums";

import { TaskPriorityBadge } from "./badges";
import { ALL_TASK_STATUSES, formatShortDate, initials } from "./helpers";
import type { BoardTask } from "./TaskCard";

export function TaskListView({
  tasks,
  onOpen,
}: {
  tasks: BoardTask[];
  onOpen: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center text-[12.5px] text-slate-400">
        Belum ada tugas.
      </div>
    );
  }

  const groups = ALL_TASK_STATUSES.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-4 overflow-x-auto pb-3">
      {groups.map((group) => {
        const meta = TASK_STATUS_META[group.status];

        return (
          <div
            key={group.status}
            className="min-w-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <span className="size-2 rounded-full" style={{ background: meta.color }} />
              <h3 className="text-[12.5px] font-bold text-slate-700">{meta.label}</h3>
              <span className="ml-0.5 rounded-full bg-white px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-400 ring-1 ring-slate-200">
                {group.items.length}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {group.items.map((task) => {
                const dueLabel = formatShortDate(task.dueDate);

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onOpen(task.id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-slate-800">
                      {task.title}
                    </p>

                    <div className="w-24 shrink-0">
                      <TaskPriorityBadge priority={task.priority} />
                    </div>

                    <div className="flex w-36 shrink-0 items-center gap-1.5">
                      <Avatar size="sm">
                        <AvatarImage src={task.assignee?.image ?? undefined} />
                        <AvatarFallback className="text-[9px]">
                          {initials(task.assignee?.name ?? task.creator?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-[11px] text-slate-400">
                        {task.assignee?.name ?? "—"}
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
        );
      })}
    </div>
  );
}
