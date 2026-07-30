// app/(dashboard)/dashboard/tasks/_modules/TaskCalendarView.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { TASK_STATUS_META } from "@/lib/enums/enums";

import type { BoardTask } from "./TaskCard";

const WEEKDAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function toDateKey(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function TaskCalendarView({
  tasks,
  onOpen,
}: {
  tasks: BoardTask[];
  onOpen: (id: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const todayKey = toDateKey(new Date());

  const tasksByDay = useMemo(() => {
    const map = new Map<string, BoardTask[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = toDateKey(new Date(task.dueDate));
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return map;
  }, [tasks]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[13.5px] font-bold text-slate-700">
          {MONTH_LABELS[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="inline-flex h-7 items-center rounded-lg border border-slate-200 px-2.5 text-[11.5px] font-semibold text-slate-500 hover:bg-slate-50"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="pb-1 text-center text-[11px] font-bold text-slate-400">
            {label}
          </div>
        ))}

        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;

          const key = toDateKey(date);
          const dayTasks = tasksByDay.get(key) ?? [];
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              className={cn(
                "flex min-h-[92px] flex-col gap-1 rounded-xl border p-1.5",
                isToday ? "border-indigo-300 bg-indigo-50/40" : "border-slate-100",
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-bold",
                  isToday ? "text-indigo-600" : "text-slate-400",
                )}
              >
                {date.getDate()}
              </span>

              <div className="flex flex-col gap-1">
                {dayTasks.slice(0, 3).map((task) => {
                  const meta = TASK_STATUS_META[task.status];
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onOpen(task.id)}
                      title={task.title}
                      className="truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-semibold"
                      style={{ background: `${meta.color}14`, color: meta.color }}
                    >
                      {task.title}
                    </button>
                  );
                })}
                {dayTasks.length > 3 && (
                  <span className="px-1.5 text-[10px] text-slate-400">
                    +{dayTasks.length - 3} lagi
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
