import { Badge } from "@/components/ui/badge";
import { PROGRAM_STATUS_META, ProgramStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

type ProgramStatusBadgeProps = {
  status: ProgramStatus;

  size?: "sm" | "md";

  shortLabel?: boolean;

  showDot?: boolean;

  className?: string;
};

export function ProgramStatusBadge({
  status,
  size = "sm",
  shortLabel = false,
  showDot = true,
  className,
}: ProgramStatusBadgeProps) {
  const meta = PROGRAM_STATUS_META[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center rounded-full border font-medium",

        size === "sm" && "gap-1.5 px-2 py-0.5 text-[11px]",

        size === "md" && "gap-2 px-2.5 py-1 text-xs",

        meta.ui.bg,
        meta.ui.text,
        meta.ui.border,

        className,
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full shrink-0",

            size === "sm" ? "size-1.5" : "size-2",

            meta.ui.dot,
          )}
          aria-hidden="true"
        />
      )}

      <span>{shortLabel ? (meta.shortLabel ?? meta.label) : meta.label}</span>
    </Badge>
  );
}

export function CountBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[22px] h-5 rounded-full px-1.5 text-[11px] font-medium border",
        count > 0
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-neutral-100 border-neutral-200 text-neutral-400",
      )}
    >
      {count}
    </span>
  );
}

export function ProgramThumb({
  thumbnail,
  title,
}: {
  thumbnail?: string | null;
  title: string;
}) {
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt={title}
        className="size-9 rounded-lg object-cover border border-neutral-200 shrink-0"
      />
    );
  }
  return (
    <div className="size-9 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 flex items-center justify-center shrink-0 text-[11px] font-semibold text-blue-700 select-none">
      {initials}
    </div>
  );
}
