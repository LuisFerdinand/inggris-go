"use client";

import { cn } from "@/lib/utils";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { usePageNav } from "./PageHeader";
import {
  PROGRAM_TAB_REGISTRY,
  ProgramTab,
} from "@/app/(dashboard)/dashboard/programs/[programId]/_modules/config/program-detail.config";
import { Skeleton } from "./ui/skeleton";

type IndicatorStyle = {
  left: number;
  width: number;
};

function useTabIndicator(
  tabs: Tab[],
  value: string,
  containerRef: RefObject<HTMLDivElement | null>,
): IndicatorStyle {
  const [style, setStyle] = useState<IndicatorStyle>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeBtn = container.querySelector<HTMLElement>(
      `[data-value="${value}"]`,
    );

    if (!activeBtn) return;

    setStyle({
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
    });
  }, [value, tabs, containerRef]);

  return style;
}

export interface Tab {
  label: string;
  value: string;
  icon?: ReactNode;
  /** Numeric badge — rendered as a pill (capped at 99+) */
  badge?: number;
  /**
   * Optional href for accessibility / right-click → open in new tab.
   * Actual navigation is handled via onValueChange (nuqs), NOT Link.
   */
  href?: string;
}

interface PageTabsProps {
  tabs: Tab[];
  /** Controlled active tab value */
  value: string;
  /** Called when user clicks a tab */
  onValueChange: (value: string) => void;
  /**
   * Show a bottom border on the tabs bar.
   * When scrolled, border is always shown regardless (scroll shadow also appears).
   * Defaults to true — tabs almost always need a separator.
   */
  borderBottom?: boolean;
  className?: string;
}

export function PageTabs({
  tabs,
  value,
  onValueChange,
  borderBottom = true,
  className,
}: PageTabsProps) {
  const { scrolled, setHasTabs } = usePageNav();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const indicatorStyle = useTabIndicator(tabs, value, scrollRef);

  /* Tell PageHeader that tabs exist → suppress its border */
  useEffect(() => {
    setHasTabs(true);
    return () => setHasTabs(false);
  }, [setHasTabs]);

  /* Scroll active tab into view when value changes (mobile) */
  useEffect(() => {
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;

    const cRect = container.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();

    if (aRect.left < cRect.left || aRect.right > cRect.right) {
      active.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [value]);

  /*
    Border priority:
    1. Scrolled → always show border (scroll state wins)
    2. Not scrolled → respect `borderBottom` prop
  */
  const showBorder = scrolled || borderBottom;

  return (
    <div
      role="tablist"
      aria-label="Program sections"
      className={cn(
        "bg-background/95 backdrop-blur-sm",
        /* Border — scroll wins, otherwise defers to prop */
        showBorder
          ? "border-b border-border/60"
          : "border-b border-transparent",
        /* Elevated shadow appears when scrolled — signals stickiness */
        scrolled ? "shadow-[0_2px_8px_0_rgba(0,0,0,0.05)]" : "shadow-none",
        "transition-[shadow,border-color] duration-200 ease-out",
        className,
      )}
    >
      {/* Scrollable track — hidden scrollbar across browsers */}
      <div
        ref={scrollRef}
        className={cn(
          "relative flex items-end",
          "px-4 lg:px-6",
          "overflow-x-auto",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.value === value;

          return (
            <button
              key={tab.value}
              id={`tab-${tab.value}`}
              ref={isActive ? activeRef : undefined}
              data-value={tab.value}
              onClick={() => onValueChange(tab.value)}
              onKeyDown={(e) => {
                const idx = tabs.findIndex((t) => t.value === value);
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  onValueChange(tabs[(idx + 1) % tabs.length].value);
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  onValueChange(
                    tabs[(idx - 1 + tabs.length) % tabs.length].value,
                  );
                }
                if (e.key === "Home") onValueChange(tabs[0].value);
                if (e.key === "End") onValueChange(tabs[tabs.length - 1].value);
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.value}`}
              {...(tab.href ? { "data-href": tab.href } : {})}
              className={cn(
                "group relative flex items-center gap-1.5 shrink-0",
                "px-3 py-3",
                "text-[13px] font-medium",
                "transition-colors duration-150",
                "cursor-pointer select-none",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-1 rounded-t-sm",
                isActive
                  ? "text-foreground bg-muted/30"
                  : [
                      "text-muted-foreground",
                      "hover:bg-muted/50 hover:text-foreground/90 rounded-t-sm",
                    ],
              )}
            >
              {/* Icon */}
              {tab.icon && (
                <span
                  className={cn(
                    "[&>svg]:size-3.5 shrink-0 transition-colors duration-150",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground/50 group-hover:text-muted-foreground",
                  )}
                >
                  {tab.icon}
                </span>
              )}

              {/* Label */}
              <span className="whitespace-nowrap">{tab.label}</span>

              {/* Badge */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center",
                    "h-4 min-w-4 px-1 rounded-full",
                    "text-[10px] font-semibold leading-none",
                    "transition-colors duration-150",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}

              {/*
                Active indicator — bottom bar
                origin-center + scale-x transition → feels like it
                "slides open" from center, matching Linear/Stripe style.
              */}
              <span
                className={cn(
                  "absolute bottom-0 left-3 right-3",
                  "h-[2px] rounded-full",
                  "bg-[#0f172a]",
                  "origin-center",
                  "transition-all duration-300 ease-out",
                  isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0",
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
        <div
          className="absolute bottom-0 h-[2px] bg-foreground rounded-full transition-[left,width] duration-200 ease-out"
          style={indicatorStyle}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function PageTabsSkeleton({
  tabCount = 5,
  className,
}: {
  tabCount?: number;
  className?: string;
}) {
  // Vary widths so it feels organic, not mechanical
  const widths = [56, 52, 44, 68, 60, 48, 72, 50];

  return (
    <div
      className={cn(
        "bg-background/95 backdrop-blur-sm",
        "border-b border-border/60",
        className,
      )}
    >
      <div className="flex items-end gap-1 px-4 lg:px-6 overflow-hidden">
        {Array.from({ length: tabCount }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 px-3 py-3">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-3.5 rounded" /> {/* icon */}
              <Skeleton
                className="h-4 rounded"
                style={{ width: widths[i % widths.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
