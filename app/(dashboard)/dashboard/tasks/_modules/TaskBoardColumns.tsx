// app/(dashboard)/dashboard/tasks/_modules/TaskBoardColumns.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { trpc } from "@/lib/trpc/client";
import { TASK_STATUS_META, type TaskStatus } from "@/lib/enums/enums";
import { BOARD_COLUMN_STATUS } from "@/app/modules/task-board/task-board.schema";

import { TaskCard, type BoardTask } from "./TaskCard";
import { ALL_TASK_STATUSES } from "./helpers";

const WORKING_STATUS_SET = new Set<string>(BOARD_COLUMN_STATUS);

const dropAnimationConfig: DropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.5" } },
  }),
};

function DroppableColumn({ status, children }: { status: TaskStatus; children: ReactNode }) {
  const { setNodeRef } = useDroppable({ id: `column-${status}` });

  return (
    <div ref={setNodeRef} className="flex min-h-[120px] flex-col gap-2.5">
      {children}
    </div>
  );
}

export function TaskBoardColumns({
  tasks,
  onOpen,
}: {
  tasks: BoardTask[];
  onOpen: (id: string) => void;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || isSuperAdmin;

  const utils = trpc.useUtils();
  const invalidate = () => utils.taskBoard.list.invalidate();

  const moveMutation = trpc.taskBoard.move.useMutation({
    onSuccess: invalidate,
    onError: (err) => toast.error(err.message || "Gagal memindahkan tugas"),
  });
  const verifyMutation = trpc.taskBoard.verify.useMutation({
    onSuccess: invalidate,
    onError: (err) => toast.error(err.message || "Gagal memverifikasi tugas"),
  });
  const resubmitMutation = trpc.taskBoard.resubmit.useMutation({
    onSuccess: invalidate,
    onError: (err) => toast.error(err.message || "Gagal mengajukan ulang tugas"),
  });
  const confirmDoneMutation = trpc.taskBoard.confirmDone.useMutation({
    onSuccess: invalidate,
    onError: (err) => toast.error(err.message || "Gagal menandai tugas selesai"),
  });

  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, BoardTask[]>();
    for (const status of ALL_TASK_STATUSES) map.set(status, []);
    for (const task of tasks) map.get(task.status)?.push(task);
    return map;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id).replace("task-", "");
    setActiveTask(tasks.find((t) => t.id === id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id).replace("task-", "");
    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    const overId = String(over.id);
    let targetStatus: TaskStatus | null = null;

    if (overId.startsWith("column-")) {
      targetStatus = overId.replace("column-", "") as TaskStatus;
    } else if (overId.startsWith("task-")) {
      const overTask = tasks.find((t) => t.id === overId.replace("task-", ""));
      targetStatus = overTask?.status ?? null;
    }

    if (!targetStatus) return;

    // Move within/into the three "working" columns — plain reorder or column change.
    if (WORKING_STATUS_SET.has(task.status) && WORKING_STATUS_SET.has(targetStatus)) {
      const targetList = grouped.get(targetStatus) ?? [];
      const maxPosition = targetList.reduce(
        (max, t) => (t.id === task.id ? max : Math.max(max, t.position)),
        -1,
      );
      const newPosition = maxPosition + 1;
      if (targetStatus === task.status && newPosition === task.position) return;

      moveMutation.mutate({
        id: task.id,
        status: targetStatus as (typeof BOARD_COLUMN_STATUS)[number],
        position: newPosition,
      });
      return;
    }

    if (targetStatus === task.status) return;

    // Dragging a pending task into "Direncanakan" approves it.
    if (task.status === "pending_review" && targetStatus === "direncanakan") {
      if (!isSuperAdmin) {
        toast.error("Hanya super admin yang dapat menyetujui tugas");
        return;
      }
      verifyMutation.mutate({ id: task.id, decision: "approve" });
      return;
    }

    // Dragging a rejected task back to "Menunggu Verifikasi" resubmits it.
    if (task.status === "rejected" && targetStatus === "pending_review") {
      const isCreator = task.createdBy === userId;
      if (!isCreator && !isAdmin) {
        toast.error("Hanya pembuat tugas yang dapat mengajukan ulang");
        return;
      }
      resubmitMutation.mutate({ id: task.id });
      return;
    }

    // Dragging a task under review into "Selesai" confirms it's done.
    if (task.status === "review" && targetStatus === "done") {
      if (!isSuperAdmin) {
        toast.error("Hanya super admin yang dapat menandai tugas selesai");
        return;
      }
      confirmDoneMutation.mutate({ id: task.id });
      return;
    }

    toast.error(
      "Perpindahan ini tidak didukung lewat drag & drop. Gunakan tombol pada detail tugas.",
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 gap-3 overflow-x-auto pb-3">
        {ALL_TASK_STATUSES.map((status) => {
          const meta = TASK_STATUS_META[status];
          const list = grouped.get(status) ?? [];

          return (
            <div
              key={status}
              className="flex w-[280px] shrink-0 flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
            >
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: meta.color }} />
                  <h2 className="text-[12.5px] font-bold text-slate-700">{meta.label}</h2>
                </div>
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-400 ring-1 ring-slate-200">
                  {list.length}
                </span>
              </div>

              <DroppableColumn status={status}>
                <SortableContext
                  items={list.map((t) => `task-${t.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {list.map((task) => (
                    <TaskCard key={task.id} task={task} draggable onOpen={onOpen} />
                  ))}
                </SortableContext>

                {list.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-[11px] text-slate-300">
                    Kosong
                  </div>
                )}
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeTask ? (
          <div className="w-[260px] rotate-2 scale-105 shadow-2xl">
            <TaskCard task={activeTask} draggable={false} onOpen={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
