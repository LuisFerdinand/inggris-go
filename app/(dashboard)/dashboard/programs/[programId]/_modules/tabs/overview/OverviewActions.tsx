import Link from "next/link";
import { CalendarPlus, Package, LayoutList, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewData } from "@/app/modules/program/server/program.router";

type Action = {
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  href?: string;
  disabled?: boolean;
};

export function OverviewActions({
  data,
  programId,
}: {
  data: OverviewData;
  programId: string;
}) {
  const isScheduled = data.scheduleType === "scheduled";

  const actions: Action[] = [
    ...(isScheduled ? [{
      label: "Add batch",
      description: "Schedule a new cohort",
      icon: <CalendarPlus className="size-5" />,
      iconBg: "bg-green-100 text-green-700",
      href: `/dashboard/programs/${programId}/batches/new`,
    }] : []),
    {
      label: "Add package",
      description: "Create a pricing tier",
      icon: <Package className="size-5" />,
      iconBg: "bg-blue-100 text-blue-700",
      href: `/dashboard/programs/${programId}/packages/new`,
    },
    {
      label: "Edit content",
      description: "Curriculum & materials",
      icon: <LayoutList className="size-5" />,
      iconBg: "bg-purple-100 text-purple-700",
      href: `/dashboard/programs/${programId}/content`,
    },
    {
      label: data.status === "published" ? "Program live" : "Publish program",
      description: data.status === "published" ? "Already visible to students" : "Make visible to students",
      icon: <Send className="size-5" />,
      iconBg: "bg-amber-100 text-amber-700",
      disabled: data.status === "published",
    },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
        Quick actions
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          const inner = (
            <div className={cn(
              "flex items-center gap-3 p-3.5 rounded-xl border border-neutral-200 transition-all duration-150",
              action.disabled
                ? "opacity-40 cursor-not-allowed bg-neutral-50"
                : "bg-white hover:bg-neutral-50 hover:border-neutral-300 cursor-pointer"
            )}>
              <div className={cn("flex size-10 items-center justify-center rounded-xl", action.iconBg)}>
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">{action.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{action.description}</p>
              </div>
            </div>
          );

          return action.href && !action.disabled ? (
            <Link key={action.label} href={action.href}>{inner}</Link>
          ) : (
            <div key={action.label}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}