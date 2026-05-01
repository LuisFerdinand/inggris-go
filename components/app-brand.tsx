"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   AppBrand — single-company sidebar header
   Replaces the old multi-team TeamSwitcher.
   
   Expanded  → full logo + name + tagline card
   Collapsed → icon-only monogram badge
   ───────────────────────────────────────────────────────────── */

export interface AppBrandProps {
  /** App / product name shown as the primary label */
  name?: string;
  /** Short tagline or product descriptor shown below the name */
  tagline?: string;
  /**
   * Optional badge label (e.g. "Pro", "Beta", "Enterprise").
   * Omit to hide the badge entirely.
   */
  badge?: string;
  /**
   * Two-letter monogram rendered inside the icon mark when collapsed.
   * Defaults to the first two uppercase letters of `name`.
   */
  monogram?: string;
}

export function AppBrand({
  name = "Acme Platform",
  tagline = "Enterprise Suite",
  badge = "Pro",
  monogram,
}: AppBrandProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const letters = (monogram ?? name.slice(0, 2)).toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={cn(
            "app-brand-root",
            isCollapsed ? "app-brand-collapsed" : "app-brand-expanded",
          )}
          aria-label={`${name} — ${tagline}`}
        >
          <div className="app-brand-icon" aria-hidden>
            <span className="app-brand-monogram">{letters}</span>
            {/* Subtle inner shine ring */}
            <span className="app-brand-icon-ring" />
          </div>

          {/* ── Text block (hidden when collapsed) ──────── */}
          {!isCollapsed && (
            <div className="app-brand-text">
              <div className="app-brand-name-row">
                <span className="app-brand-name">{name}</span>
                {badge && (
                  <span
                    className="app-brand-badge"
                    aria-label={`Plan: ${badge}`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span className="app-brand-tagline">{tagline}</span>
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
