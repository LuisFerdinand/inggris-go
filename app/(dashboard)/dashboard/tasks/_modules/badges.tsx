// app/(dashboard)/dashboard/tasks/_modules/badges.tsx
"use client";

import {
  ArrowDown,
  ArrowUp,
  Flame,
  Minus,
} from "lucide-react";

import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_META,
  TASK_STATUS_LABEL,
  TASK_STATUS_META,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/enums/enums";

function tintedBadgeClass() {
  return "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap";
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const meta = TASK_STATUS_META[status];

  return (
    <span
      className={tintedBadgeClass()}
      style={{
        borderColor: `${meta.color}33`,
        background: `${meta.color}14`,
        color: meta.color,
      }}
    >
      {TASK_STATUS_LABEL[status]}
    </span>
  );
}

const PRIORITY_ICON: Record<TaskPriority, React.ComponentType<{ className?: string }>> = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  urgent: Flame,
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = TASK_PRIORITY_META[priority];
  const Icon = PRIORITY_ICON[priority];

  return (
    <span
      className={tintedBadgeClass()}
      style={{
        borderColor: `${meta.color}33`,
        background: `${meta.color}14`,
        color: meta.color,
      }}
    >
      <Icon className="size-3" />
      {TASK_PRIORITY_LABEL[priority]}
    </span>
  );
}
