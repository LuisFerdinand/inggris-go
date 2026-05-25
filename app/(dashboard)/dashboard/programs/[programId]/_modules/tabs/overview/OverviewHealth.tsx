import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewData } from "@/app/modules/program/server/program.router";

type HealthItem = {
  type: "warn" | "ok" | "info";
  title: string;
  description: string;
};

function buildHealthItems(
  health: OverviewData["health"],
  scheduleType: string,
): HealthItem[] {
  const items: HealthItem[] = [];

  if (!health.hasPackages) {
    items.push({
      type: "warn",
      title: "No packages configured",
      description:
        "Students can't enroll without at least one pricing package.",
    });
  }
  if (scheduleType === "scheduled" && !health.hasBatches) {
    items.push({
      type: "warn",
      title: "No active batch",
      description:
        "Scheduled programs need at least one open batch for enrollment.",
    });
  }
  if (!health.hasContent) {
    items.push({
      type: "info",
      title: "No curriculum content",
      description: "Add sections and materials to the Content tab.",
    });
  }
  if (health.hasPackages && health.hasContent) {
    items.push({
      type: "ok",
      title: "Core setup complete",
      description: "Content and packages are in place.",
    });
  }

  return items;
}

const STYLES = {
  warn: {
    wrap: "bg-amber-50 border-amber-200",
    icon: <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />,
    title: "text-amber-900",
    desc: "text-amber-700",
  },
  ok: {
    wrap: "bg-green-50 border-green-200",
    icon: <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />,
    title: "text-green-900",
    desc: "text-green-700",
  },
  info: {
    wrap: "bg-blue-50 border-blue-200",
    icon: <Info className="size-4 text-blue-600 mt-0.5 shrink-0" />,
    title: "text-blue-900",
    desc: "text-blue-700",
  },
};

export function OverviewHealth({
  health,
  scheduleType,
}: {
  health: OverviewData["health"];
  scheduleType: string;
}) {
  const items = buildHealthItems(health, scheduleType);
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        Setup health
      </p>
      {items.map((item, i) => {
        const s = STYLES[item.type];
        return (
          <div
            key={i}
            className={cn("flex gap-3 rounded-lg border px-3.5 py-3", s.wrap)}
          >
            {s.icon}
            <div>
              <p className={cn("text-sm font-medium", s.title)}>{item.title}</p>
              <p className={cn("text-xs mt-0.5", s.desc)}>{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
