// app/(dashboard)/dashboard/projects/_modules/project-badges.tsx
"use client";

import { PROJECT_STATUS_LABEL, PROJECT_STATUS_META, type ProjectStatus } from "@/lib/enums/enums";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap"
      style={{
        borderColor: `${meta.color}33`,
        background: `${meta.color}14`,
        color: meta.color,
      }}
    >
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}
