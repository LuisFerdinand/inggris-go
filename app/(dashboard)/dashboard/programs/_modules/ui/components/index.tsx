// app/(dashboard)/dashboard/programs/_modules/ui/components/index.tsx
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { EnumMeta } from "@/lib/enums/enum.types";

import { PROGRAM_STATUS_META, ProgramStatus } from "@/lib/enums/enums";

import { getToneStyle } from "@/lib/ui/ui.helpers";
import { SIZE_STYLES } from "@/lib/ui/ui.index";

import { cn } from "@/lib/utils";

type MetaBadgeProps = {
  meta: EnumMeta;

  size?: "sm" | "md";

  shortLabel?: boolean;

  showIcon?: boolean;

  tooltip?: boolean;

  className?: string;
};

export function MetaBadge({
  meta,
  size = "sm",
  shortLabel = false,
  showIcon = true,

  tooltip = true,
  className,
}: MetaBadgeProps) {
  const tone = getToneStyle(meta.tone);

  const styles = SIZE_STYLES[size];

  return (
    <Badge
      variant="outline"
      title={tooltip ? meta.shortDesc : undefined}
      className={cn(
        "inline-flex items-center rounded-full border font-medium shadow-none transition-colors",

        tone.bg,
        tone.text,
        tone.border,

        styles.root,

        className,
      )}
    >
      {showIcon && meta.icon && (
        <Icon
          name={meta.icon}
          className={cn("shrink-0 opacity-80", styles.icon)}
        />
      )}

      <span className="truncate">
        {shortLabel ? (meta.shortLabel ?? meta.label) : meta.label}
      </span>
    </Badge>
  );
}

type ProgramStatusBadgeProps = {
  status: ProgramStatus;
} & Omit<React.ComponentProps<typeof MetaBadge>, "meta">;

export function ProgramStatusBadge({
  status,
  ...props
}: ProgramStatusBadgeProps) {
  return <MetaBadge meta={PROGRAM_STATUS_META[status]} {...props} />;
}

type CountBadgeProps = {
  count: number;

  tone?: keyof typeof import("@/lib/ui/ui.index").TONE_STYLES;

  className?: string;
};

export function CountBadge({
  count,
  tone = count > 0 ? "primary" : "neutral",
  className,
}: CountBadgeProps) {
  const styles = getToneStyle(tone);

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[22px] items-center justify-center rounded-full border px-1.5 text-[11px] font-medium",

        styles.bg,
        styles.border,
        styles.text,

        className,
      )}
    >
      {count}
    </span>
  );
}

type ProgramThumbProps = {
  thumbnail?: string | null;

  title: string;

  tone?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";

  className?: string;
};

export function ProgramThumb({
  thumbnail,
  title,
  tone = "primary",
  className,
}: ProgramThumbProps) {
  const styles = getToneStyle(tone);

  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt={title}
        className={cn(
          "size-9 shrink-0 rounded-lg border object-cover",

          styles.border,

          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-9 shrink-0 select-none items-center justify-center rounded-lg border text-[11px] font-semibold",

        styles.bg,
        styles.border,
        styles.text,

        className,
      )}
    >
      {initials}
    </div>
  );
}
