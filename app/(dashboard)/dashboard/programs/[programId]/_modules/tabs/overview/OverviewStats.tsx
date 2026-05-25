import { OverviewData } from "@/app/modules/program/server/program.router";
import { CalendarDays, Package, Users, LayoutList } from "lucide-react";

const STATS = [
  { key: "batchesCount", label: "Batches", icon: CalendarDays },
  { key: "packagesCount", label: "Packages", icon: Package },
  { key: "enrollmentsCount", label: "Enrollments", icon: Users },
  { key: "contentSectionsCount", label: "Content sections", icon: LayoutList },
] as const;

export function OverviewStats({ stats }: { stats: OverviewData["stats"] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STATS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-3.5"
        >
          <p className="text-2xl font-semibold text-neutral-800 tabular-nums">
            {stats[key].toLocaleString()}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
            <Icon className="size-3.5" />
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
