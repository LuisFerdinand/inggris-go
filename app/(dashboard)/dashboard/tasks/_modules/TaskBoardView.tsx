// app/(dashboard)/dashboard/tasks/_modules/TaskBoardView.tsx
"use client";

import { useState } from "react";
import { KanbanSquare, List, Loader2, Plus } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_PRIORITY, TASK_PRIORITY_LABEL } from "@/lib/enums/enums";

import { TaskBoardColumns } from "./TaskBoardColumns";
import { TaskListView } from "./TaskListView";
import { CreateTaskSheet } from "./CreateTaskSheet";
import { TaskDetailSheet } from "./TaskDetailSheet";

type ViewMode = "board" | "list";

export function TaskBoardView() {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  const filterInput = {
    assigneeId: assigneeFilter || undefined,
    priority: (priorityFilter || undefined) as (typeof TASK_PRIORITY)[number] | undefined,
    mine: onlyMine || undefined,
  };

  const usersQuery = trpc.taskBoard.listAssignableUsers.useQuery();
  const tasksQuery = trpc.taskBoard.list.useQuery(filterInput);
  const tasks = tasksQuery.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 px-4 pb-6 pt-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-800 sm:text-[20px]">
            <KanbanSquare className="size-5 text-indigo-600" />
            Papan Tugas
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-400">
            Kelola tugas tim — buat, verifikasi, dan pantau progres bersama.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
          >
            <Plus className="size-3.5" /> Tugas Baru
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={assigneeFilter || "all"} onValueChange={(v) => setAssigneeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 text-[12px]">
            <SelectValue placeholder="Semua penanggung jawab" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua penanggung jawab</SelectItem>
            {usersQuery.data?.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter || "all"} onValueChange={(v) => setPriorityFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 text-[12px]">
            <SelectValue placeholder="Semua urgensi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua urgensi</SelectItem>
            {TASK_PRIORITY.map((p) => (
              <SelectItem key={p} value={p}>
                {TASK_PRIORITY_LABEL[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setOnlyMine((v) => !v)}
          className={cn(
            "inline-flex h-8 items-center rounded-lg border px-3 text-[12px] font-semibold transition-colors",
            onlyMine
              ? "border-indigo-200 bg-indigo-50 text-indigo-600"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
          )}
        >
          Dibuat Saya
        </button>
      </div>

      {tasksQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-[12.5px]">Memuat papan tugas…</span>
        </div>
      ) : viewMode === "board" ? (
        <TaskBoardColumns tasks={tasks} onOpen={setSelectedTaskId} />
      ) : (
        <TaskListView tasks={tasks} onOpen={setSelectedTaskId} />
      )}

      <CreateTaskSheet open={createOpen} onOpenChange={setCreateOpen} />
      <TaskDetailSheet taskId={selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)} />
    </div>
  );
}
