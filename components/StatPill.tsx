import * as React from "react";

import { cn } from "@/lib/utils";
import { SIZE_STYLES, TONE_STYLES, ToneType } from "@/lib/ui/ui.index";

export type StatPillProps = {
  icon?: React.ReactNode;

  value: React.ReactNode;

  label?: React.ReactNode;

  tone?: ToneType;

  size?: "sm" | "md";

  className?: string;

  valueClassName?: string;

  labelClassName?: string;

  iconClassName?: string;
};

export function StatPill({
  icon,
  value,
  label,
  tone = "neutral",
  size = "md",
  className,
  valueClassName,
  labelClassName,
  iconClassName,
}: StatPillProps) {
  const toneStyles = TONE_STYLES[tone];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <div className={cn("inline-flex items-center", sizeStyles.root, className)}>
      {icon && (
        <span
          className={cn(
            "flex items-center justify-center",
            toneStyles.text,
            sizeStyles.icon,
            iconClassName,
          )}
        >
          {icon}
        </span>
      )}

      <span
        className={cn(
          "font-semibold tabular-nums text-neutral-800",
          sizeStyles.value,
          valueClassName,
        )}
      >
        {value}
      </span>

      {label && (
        <span
          className={cn("text-neutral-500", sizeStyles.label, labelClassName)}
        >
          {label}
        </span>
      )}
    </div>
  );
}
