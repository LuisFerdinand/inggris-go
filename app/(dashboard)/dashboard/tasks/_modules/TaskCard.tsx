// app/(dashboard)/dashboard/tasks/_modules/TaskCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CalendarClock, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RouterOutputs } from "@/lib/trpc/react";

import { TaskPriorityBadge } from "./badges";
import { formatShortDate, initials } from "./helpers";

export type BoardTask = RouterOutputs["taskBoard"]["list"][number];

function TaskCardBody({ task }: { task: BoardTask }) {
  const [now] = useState(() => Date.now());
  const dueLabel = formatShortDate(task.dueDate);
  const isOverdue =
    !!task.dueDate && task.status !== "done" && new Date(task.dueDate).getTime() < now;

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-indigo-200 hover:shadow-md">
      {task.coverImageUrl && (
        <div className="relative h-24 w-full overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={task.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="280px"
          />
        </div>
      )}

      <p className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-800">
        {task.title}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <TaskPriorityBadge priority={task.priority} />
        {dueLabel && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
              isOverdue
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-slate-50 text-slate-500",
            )}
          >
            <CalendarClock className="size-3" />
            {dueLabel}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          <Avatar size="sm">
            <AvatarImage src={task.assignee?.image ?? undefined} />
            <AvatarFallback className="text-[9px]">
              {initials(task.assignee?.name ?? task.creator?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[110px] truncate text-[11px] text-slate-400">
            {task.assignee?.name ?? task.creator?.name ?? "—"}
          </span>
        </div>

        {task.commentCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <MessageCircle className="size-3" />
            {task.commentCount}
          </span>
        )}
      </div>
    </div>
  );
}

export function TaskCard({
  task,
  draggable,
  onOpen,
}: {
  task: BoardTask;
  draggable: boolean;
  onOpen: (id: string) => void;
}) {
  if (!draggable) {
    return (
      <button
        type="button"
        onClick={() => onOpen(task.id)}
        className="w-full text-left"
      >
        <TaskCardBody task={task} />
      </button>
    );
  }

  return <SortableTaskCard task={task} onOpen={onOpen} />;
}

function SortableTaskCard({
  task,
  onOpen,
}: {
  task: BoardTask;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `task-${task.id}`,
      transition: {
        duration: 220,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task.id)}
      className={cn(
        "touch-none cursor-grab rounded-2xl active:cursor-grabbing",
        isDragging && "z-10 scale-[1.03] opacity-50 shadow-xl",
      )}
    >
      <TaskCardBody task={task} />
    </div>
  );
}
