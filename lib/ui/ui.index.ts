// lib/ui/ui.index.ts

export type ToneStyle = {
  bg: string;
  text: string;
  border: string;
  dot: string;
  softBg: string;
};

export const TONE = [
  "primary",
  "success",
  "warning",
  "danger",
  "info",
  "neutral",
] as const;
export type ToneType = (typeof TONE)[number];

export const TONE_STYLES = {
  primary: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    softBg: "bg-blue-500/10",
  },

  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    softBg: "bg-emerald-500/10",
  },

  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    softBg: "bg-amber-500/10",
  },

  danger: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    softBg: "bg-red-500/10",
  },

  info: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
    softBg: "bg-cyan-500/10",
  },

  neutral: {
    bg: "bg-neutral-100",
    text: "text-neutral-700",
    border: "border-neutral-200",
    dot: "bg-neutral-400",
    softBg: "bg-neutral-500/10",
  },
} satisfies Record<ToneType, ToneStyle>;

export const SIZE_STYLES = {
  sm: {
    root: "gap-1",
    value: "text-xs",
    label: "text-[11px]",
    icon: "size-3.5",
    padding: "px-2 py-0.5",
  },

  md: {
    root: "gap-1.5",
    value: "text-[13px]",
    label: "text-[12px]",
    icon: "size-4",
    padding: "px-2.5 py-1",
  },
} as const;
