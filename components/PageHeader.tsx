// components/PageHeader.tsx
"use client";

import Link from "next/link";
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
  useMemo,
  useState,
} from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { PageTabsSkeleton } from "./PageTabs";

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

  const value = useMemo(
    () => ({
      scrolled,
      hasTabs,
      setHasTabs,
    }),
    [scrolled, hasTabs],
  );

  return (
    <PageNavContext.Provider value={value}>
      <div
        className={cn(
          sticky && ["sticky z-40", "top-10"],
          className,
        )}
      >
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

export type TitleBadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "outline";

export type TitleBadge = {
  label: string;
  icon?: ReactNode;
  variant?: TitleBadgeVariant;
  className?: string;
};

type BadgeLike =
  | string
  | TitleBadge
  | {
      label: string;
      variant?: TitleBadgeVariant;
      icon?: ReactNode;
      className?: string;
    };

interface PageHeaderProps {
  breadcrumbs: Crumb[];
  title: string;
  description?: string;
  activeTabCrumb?: Crumb;
  backButton?:
    | { href: string; onClick?: never }
    | { onClick: () => void; href?: never };

  /**
   * Preferred prop.
   */
  titleBadge?: TitleBadge;

  /**
   * Compatibility prop, so code using `badge="Draft"` or
   * `badge={{ label, variant }}` still works.
   */
  badge?: BadgeLike;

  actions?: ReactNode;
  borderBottom?: boolean;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function normalizeBadge(
  titleBadge?: TitleBadge,
  badge?: BadgeLike,
): TitleBadge | null {
  if (titleBadge) return titleBadge;
  if (!badge) return null;

  if (typeof badge === "string") {
    return { label: badge, variant: "default" };
  }

  return {
    label: badge.label,
    icon: badge.icon,
    variant: badge.variant ?? "default",
    className: badge.className,
  };
}

function badgeClassName(variant: TitleBadgeVariant = "default") {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "danger":
      return "border-red-200 bg-red-50 text-red-700";
    case "secondary":
      return "border-neutral-200 bg-neutral-50 text-neutral-600";
    case "outline":
      return "border-[var(--border-soft)] bg-white text-[var(--text-muted)]";
    case "default":
    default:
      return "border-blue-100 bg-blue-50 text-blue-700";
  }
}

function truncateClass(index: number, isLast: boolean) {
  if (isLast) return "max-w-[180px] sm:max-w-[260px]";
  if (index === 0) return "max-w-[100px] sm:max-w-[140px]";
  return "max-w-[120px] sm:max-w-[180px]";
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
  badge,
  actions,
  borderBottom = true,
  className,
}: PageHeaderProps) {
  const { scrolled, hasTabs } = usePageNav();

  const isCompact = scrolled;
  const showBottomBorder = scrolled ? !hasTabs : borderBottom;

  const allCrumbs: Crumb[] = activeTabCrumb
    ? [...breadcrumbs, activeTabCrumb]
    : breadcrumbs;

  const normalizedBadge = normalizeBadge(titleBadge, badge);

  const BackBtn = backButton ? (
    <Button
      {...(backButton.href
        ? { asChild: true }
        : { onClick: backButton.onClick })}
      variant="outline"
      size="icon"
      className="mt-0.5 size-9 shrink-0 rounded-lg"
    >
      {backButton.href ? (
        <Link href={backButton.href} aria-label="Kembali">
          <ArrowLeft className="size-4" />
        </Link>
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
      <Breadcrumb
        className={cn(
          "transition-[margin] duration-200",
          isCompact ? "mb-1.5" : "mb-3",
          backButton && "pl-[calc(2.25rem+1rem)]",
        )}
      >
        <BreadcrumbList className="flex flex-nowrap items-center gap-0.5 overflow-hidden">
          {allCrumbs.map((crumb, index) => {
            const isLast = index === allCrumbs.length - 1;

            return (
              <React.Fragment key={`${crumb.label}-${index}`}>
                <BreadcrumbItem className="min-w-0">
                  {isLast ? (
                    <BreadcrumbPage
                      className={cn(
                        "flex min-w-0 items-center gap-1.5",
                        "rounded-md bg-slate-100 px-2 py-0.5",
                        "text-[11px] font-semibold tracking-wide text-foreground/80",
                        truncateClass(index, isLast),
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
                      asChild
                      className={cn(
                        "flex min-w-0 items-center gap-1.5",
                        "text-[11px] font-medium text-muted-foreground/70",
                        "no-underline transition-colors duration-150 hover:text-foreground",
                        truncateClass(index, isLast),
                      )}
                    >
                      <Link href={crumb.href ?? "#"}>
                        {crumb.icon && (
                          <span className="shrink-0 [&>svg]:size-3">
                            {crumb.icon}
                          </span>
                        )}
                        <span className="truncate">{crumb.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator className="mx-0.5 shrink-0 text-muted-foreground/25 [&>svg]:size-3">
                    <ChevronRight />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex min-w-0 items-start justify-between gap-4">
        {BackBtn}

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "flex min-w-0 items-center gap-2",
              isCompact ? "mb-0" : "mb-0.5",
            )}
          >
            <h1
              className={cn(
                "truncate font-bold leading-none text-neutral-800",
                "transition-[font-size,line-height] duration-200 ease-out",
                isCompact ? "text-base" : "text-lg",
              )}
            >
              {title}
            </h1>

            {normalizedBadge && (
              <span
                className={cn(
                  "hidden items-center gap-1 rounded-full border px-2.5 py-0.5 sm:inline-flex",
                  "text-xs font-semibold",
                  "transition-[opacity,transform] duration-200",
                  isCompact
                    ? "pointer-events-none scale-95 opacity-0"
                    : "scale-100 opacity-100",
                  badgeClassName(normalizedBadge.variant),
                  normalizedBadge.className,
                )}
              >
                {normalizedBadge.icon && (
                  <span className="[&>svg]:size-3">
                    {normalizedBadge.icon}
                  </span>
                )}
                {normalizedBadge.label}
              </span>
            )}
          </div>

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
                <p className="mt-1 line-clamp-1 text-sm leading-snug text-neutral-400">
                  {description}
                </p>
              </div>
            </div>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKELETONS
═══════════════════════════════════════════════════════════════ */

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white px-4 pt-5 pb-4 lg:px-6",
        "border-b border-transparent",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-md" />
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="h-5 w-28 rounded-md" />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PageNavSkeleton({
  tabCount = 5,
  sticky,
  className,
}: {
  tabCount?: number;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(sticky && ["sticky z-40", "top-10"], className)}>
      <PageHeaderSkeleton />
      <PageTabsSkeleton tabCount={tabCount} />
    </div>
  );
}