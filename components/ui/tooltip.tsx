"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type TooltipVariant = "default" | "info" | "warning" | "success" | "brand";
type TooltipSize = "sm" | "md" | "lg";

interface TooltipContentProps extends React.ComponentProps<
  typeof TooltipPrimitive.Content
> {
  variant?: TooltipVariant;
  size?: TooltipSize;
  showArrow?: boolean;
  /** Optional icon rendered before children */
  icon?: React.ReactNode;
}

// ─── Variant & size maps ─────────────────────────────────────────────────────

const variantStyles: Record<
  TooltipVariant,
  { content: string; arrow: string }
> = {
  default: {
    content: [
      "bg-[#0f172a]", // --text-main (deep navy-black)
      "text-white",
      "border border-white/10",
      "shadow-[0_8px_32px_rgba(10,45,135,0.35),0_2px_8px_rgba(0,0,0,0.25)]",
    ].join(" "),
    arrow: "fill-[#0f172a]",
  },
  info: {
    content: [
      "bg-[#0a2d87]", // --blue-navy
      "text-white",
      "border border-white/10",
      "shadow-[0_8px_32px_rgba(10,45,135,0.45)]",
    ].join(" "),
    arrow: "fill-[#0a2d87]",
  },
  warning: {
    content: [
      "bg-[#f7b500]", // --gold
      "text-[#060f2e]", // --blue-abyss (readable on gold)
      "border border-[#e8940a]/30",
      "shadow-[0_8px_32px_rgba(180,100,0,0.35)]",
    ].join(" "),
    arrow: "fill-[#f7b500]",
  },
  success: {
    content: [
      "bg-[#2db8b0]", // --teal
      "text-white",
      "border border-white/10",
      "shadow-[0_8px_32px_rgba(45,184,176,0.35)]",
    ].join(" "),
    arrow: "fill-[#2db8b0]",
  },
  brand: {
    content: [
      // vivid blue → gold gradient card
      "bg-gradient-to-br from-[#1a52c8] to-[#1e6eee]",
      "text-white",
      "border border-white/15",
      "shadow-[0_8px_40px_rgba(26,82,200,0.45),0_2px_8px_rgba(0,0,0,0.2)]",
    ].join(" "),
    arrow: "fill-[#1e6eee]",
  },
};

const sizeStyles: Record<TooltipSize, { content: string; text: string }> = {
  sm: { content: "px-2.5 py-1", text: "text-[11px] leading-4" },
  md: { content: "px-3.5 py-2", text: "text-xs leading-5" },
  lg: { content: "px-4 py-2.5", text: "text-sm leading-5" },
};

// ─── Animation class shared across all states ────────────────────────────────

const animationClasses = [
  // enter
  "data-[state=delayed-open]:animate-in",
  "data-[state=delayed-open]:fade-in-0",
  "data-[state=delayed-open]:zoom-in-95",
  "data-[state=instant-open]:animate-in",
  "data-[state=instant-open]:fade-in-0",
  "data-[state=instant-open]:zoom-in-95",
  // exit
  "data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0",
  "data-[state=closed]:zoom-out-95",
  // slide per side
  "data-[side=bottom]:slide-in-from-top-1.5",
  "data-[side=top]:slide-in-from-bottom-1.5",
  "data-[side=left]:slide-in-from-right-1.5",
  "data-[side=right]:slide-in-from-left-1.5",
].join(" ");

// ─── Sub-components ──────────────────────────────────────────────────────────

function TooltipProvider({
  delayDuration = 300,
  skipDelayDuration = 100,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 8,
  children,
  variant = "default",
  size = "md",
  showArrow = true,
  icon,
  ...props
}: TooltipContentProps) {
  const { content: variantCls, arrow: arrowFill } = variantStyles[variant];
  const { content: sizeCls, text: textCls } = sizeStyles[size];

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // ── Layout ──
          "z-50 inline-flex w-fit max-w-[280px] items-start gap-1.5",
          "origin-[var(--radix-tooltip-content-transform-origin)]",
          // ── Shape ──
          "rounded-lg",
          // ── Typography ──
          "font-medium tracking-tight",
          // ── Variant (bg, text, border, shadow) ──
          variantCls,
          // ── Size (padding, font size) ──
          sizeCls,
          textCls,
          // ── Animations ──
          animationClasses,
          // ── Duration ──
          "duration-150",
          className,
        )}
        {...props}
      >
        {/* Optional leading icon */}
        {icon && (
          <span className="mt-px shrink-0 opacity-80 [&_svg]:size-3.5">
            {icon}
          </span>
        )}

        {/* Content */}
        <span className="leading-relaxed">{children}</span>

        {/* Arrow */}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={cn(
              "z-50 size-3",
              "translate-y-[calc(-50%_-_1px)]",
              arrowFill,
            )}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

export type { TooltipVariant, TooltipSize, TooltipContentProps };
