// app/(dashboard)/dashboard/tasks/_modules/helpers.ts
import type { TaskStatus } from "@/lib/enums/enums";

export const ALL_TASK_STATUSES: TaskStatus[] = [
  "pending_review",
  "direncanakan",
  "in_progress",
  "review",
  "done",
  "rejected",
];

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatShortDate(date: Date | string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
