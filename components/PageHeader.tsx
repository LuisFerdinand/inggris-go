"use client";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   SCROLL DETECTION
═══════════════════════════════════════════════════════════════ */

function useScrolled(threshold = 2): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, [threshold]);

  return scrolled;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE NAV CONTEXT
═══════════════════════════════════════════════════════════════ */

type PageNavContextValue = {
  scrolled: boolean;
  hasTabs: boolean;
  setHasTabs: (v: boolean) => void;
};

const PageNavContext = createContext<PageNavContextValue>({
  scrolled: false,
  hasTabs: false,
  setHasTabs: () => {},
});

export function usePageNav() {
  return useContext(PageNavContext);
}

/* ═══════════════════════════════════════════════════════════════
   PAGE NAV PROVIDER
═══════════════════════════════════════════════════════════════ */

interface PageNavProps {
  children: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function PageNav({ children, sticky, className }: PageNavProps) {
  const scrolled = useScrolled();
  const [hasTabs, setHasTabs] = useState(false);

  return (
    <PageNavContext.Provider value={{ scrolled, hasTabs, setHasTabs }}>
      <div className={cn(sticky && ["sticky z-40", "top-10"], className)}>
        {children}
      </div>
    </PageNavContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

export type Crumb = {
  label: string;
  href?: string;
  icon?: ReactNode;
};

export type TitleBadge = {
  label: string;
  icon?: ReactNode;
  /** Defaults to a neutral/blue pill. Pass className to override. */
  className?: string;
};

interface PageHeaderProps {
  /** Static breadcrumb trail */
  breadcrumbs: Crumb[];
  /** Page title */
  title: string;
  /** Subtitle — hidden on scroll */
  description?: string;
  /**
   * Dynamic final breadcrumb that mirrors the active tab.
   * Appended after `breadcrumbs`.
   */
  activeTabCrumb?: Crumb;
  /**
   * Optional back button rendered to the left of the title block.
   * Pass an href string for a link, or an onClick handler for a button.
   */
  backButton?:
    | { href: string; onClick?: never }
    | { onClick: () => void; href?: never };
  /**
   * Optional badge rendered inline after the title text.
   * Good for status labels like "Draft", "Langkah pertama", etc.
   */
  titleBadge?: TitleBadge;
  /** Slot for CTA buttons — always visible */
  actions?: ReactNode;
  /**
   * Show a bottom border when NOT scrolled.
   * When scrolled (without tabs), the border is always shown regardless.
   * Defaults to false — border is situational.
   */
  borderBottom?: boolean;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER
═══════════════════════════════════════════════════════════════ */

export function PageHeader({
  breadcrumbs,
  title,
  description,
  activeTabCrumb,
  backButton,
  titleBadge,
  actions,
  borderBottom = true,
  className,
}: PageHeaderProps) {
  const { scrolled, hasTabs } = usePageNav();

  const isCompact = scrolled;
  /*
    Border priority (highest → lowest):
    1. Scrolled without tabs → always show border (scroll wins)
    2. Scrolled with tabs   → never show border (tabs own the separator)
    3. Not scrolled         → respect `borderBottom` prop
  */
  const showBottomBorder = scrolled ? !hasTabs : borderBottom;

  const allCrumbs: Crumb[] = activeTabCrumb
    ? [...breadcrumbs, activeTabCrumb]
    : breadcrumbs;

  /* Back button element — shared between compact and expanded */
  const BackBtn = backButton ? (
    <Button
      {...(backButton.href
        ? { asChild: true }
        : { onClick: backButton.onClick })}
      variant="outline"
      size="icon"
      className="size-9 shrink-0 rounded-lg mt-0.5"
    >
      {backButton.href ? (
        <a href={backButton.href}>
          <ArrowLeft className="size-4" />
        </a>
      ) : (
        <ArrowLeft className="size-4" />
      )}
    </Button>
  ) : null;

  return (
    <div
      className={cn(
        "bg-white",
        "px-4 lg:px-6",
        "transition-[padding,border-color,box-shadow] duration-200 ease-out",
        isCompact ? "pt-2.5 pb-2" : "pt-5 pb-4",
        showBottomBorder
          ? "border-b border-border/60 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
          : "border-b border-transparent",
        className,
      )}
    >
      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <Breadcrumb
        className={cn(
          "transition-[margin] duration-200",
          isCompact ? "mb-1.5" : "mb-3",
          /* Indent breadcrumb when back button is present so it aligns
             with the title text rather than the button edge. */
          backButton && "pl-[calc(2.25rem+1rem)]", // size-9 + gap-4
        )}
      >
        <BreadcrumbList className="flex items-center flex-nowrap gap-0.5 overflow-hidden">
          {allCrumbs.map((crumb, i) => {
            const isLast = i === allCrumbs.length - 1;

            return (
              <React.Fragment key={i}>
                <BreadcrumbItem className="min-w-0">
                  {isLast ? (
                    <BreadcrumbPage
                      className={cn(
                        "flex items-center gap-1.5 min-w-0",
                        "text-[11px] font-semibold tracking-wide",
                        "text-foreground/80",
                        "bg-slate-100 rounded-md px-2 py-0.5",
                        "truncate max-w-[180px]",
                      )}
                    >
                      {crumb.icon && (
                        <span className="shrink-0 text-foreground/50 [&>svg]:size-3">
                          {crumb.icon}
                        </span>
                      )}
                      <span className="truncate">{crumb.label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={crumb.href ?? "#"}
                      className={cn(
                        "flex items-center gap-1.5 min-w-0",
                        "text-[11px] font-medium",
                        "text-muted-foreground/70",
                        "hover:text-foreground",
                        "transition-colors duration-150",
                        "no-underline",
                        "truncate max-w-[120px]",
                      )}
                    >
                      {crumb.icon && (
                        <span className="shrink-0 [&>svg]:size-3">
                          {crumb.icon}
                        </span>
                      )}
                      <span className="truncate">{crumb.label}</span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator className="shrink-0 text-muted-foreground/25 [&>svg]:size-3 mx-0.5">
                    <ChevronRight />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Title row ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 min-w-0">
        {/* Optional back button */}
        {BackBtn}

        {/* Left: title + description */}
        <div className="min-w-0 flex-1">
          {/* Title + inline badge */}
          <div
            className={cn(
              "flex items-center gap-2",
              isCompact ? "mb-0" : "mb-0.5",
            )}
          >
            <h1
              className={cn(
                "font-bold text-neutral-800 leading-none truncate",
                "transition-[font-size,line-height] duration-200 ease-out",
                isCompact ? "text-base" : "text-lg",
              )}
            >
              {title}
            </h1>

            {titleBadge && (
              <span
                className={cn(
                  "hidden sm:inline-flex items-center gap-1",
                  "rounded-full px-2.5 py-0.5",
                  "text-xs font-semibold",
                  "transition-[opacity,transform] duration-200",
                  isCompact
                    ? "opacity-0 scale-95 pointer-events-none"
                    : "opacity-100 scale-100",
                  // default blue pill — override via titleBadge.className
                  "bg-blue-50 border border-blue-100 text-blue-600",
                  titleBadge.className,
                )}
              >
                {titleBadge.icon && (
                  <span className="[&>svg]:size-3">{titleBadge.icon}</span>
                )}
                {titleBadge.label}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                isCompact
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-sm text-neutral-400 leading-snug line-clamp-1 mt-1">
                  {description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: actions — always visible */}
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
