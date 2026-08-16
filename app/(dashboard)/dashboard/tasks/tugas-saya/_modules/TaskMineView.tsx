// app/(dashboard)/dashboard/tasks/tugas-saya/_modules/TaskMineView.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDays, KanbanSquare, List, ListChecks, Loader2 } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import { TaskBoardColumns } from "../../_modules/TaskBoardColumns";
import { TaskListView } from "../../_modules/TaskListView";
import { TaskCalendarView } from "../../_modules/TaskCalendarView";
import { TaskDetailSheet } from "../../_modules/TaskDetailSheet";

type ViewMode = "board" | "list" | "calendar";

export function TaskMineView() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasksQuery = trpc.taskBoard.list.useQuery(
    { assigneeId: userId },
    { enabled: !!userId },
  );
  const tasks = tasksQuery.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 px-4 pb-6 pt-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
            <ListChecks className="size-5 text-indigo-600" />
            Tugas Saya
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-400">
            Semua tugas yang ditugaskan kepada Anda, di seluruh proyek.
          </p>
        </div>

        <div className="inline-flex shrink-0 rounded-xl border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("board")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
              viewMode === "board"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            <KanbanSquare className="size-3.5" /> Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
              viewMode === "list"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            <List className="size-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
              viewMode === "calendar"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            <CalendarDays className="size-3.5" /> Kalender
          </button>
        </div>
      </div>

      {tasksQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-[12.5px]">Memuat tugas Anda…</span>
        </div>
      ) : viewMode === "board" ? (
        <TaskBoardColumns tasks={tasks} onOpen={setSelectedTaskId} />
      ) : viewMode === "list" ? (
        <TaskListView tasks={tasks} onOpen={setSelectedTaskId} />
      ) : (
        <TaskCalendarView tasks={tasks} onOpen={setSelectedTaskId} />
      )}

      <TaskDetailSheet
        taskId={selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />
    </div>
  );
}
