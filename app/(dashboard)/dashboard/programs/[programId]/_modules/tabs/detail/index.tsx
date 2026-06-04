// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/detail/index.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X, Check, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DetailData as ProgramDetailData } from "@/app/modules/program/server/program.router";

/* ─────────────────────────────────────────────────────────────
   TYPES — DetailData shape from getDetail query
   (Mirror your actual tRPC return shape here)
───────────────────────────────────────────────────────────── */

export type DetailData = ProgramDetailData;
export type DetailCategory = DetailData["category"];

/* ─────────────────────────────────────────────────────────────
   LABEL MAPS
───────────────────────────────────────────────────────────── */

export const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

export const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const STATUS_META: Record<
  string,
  {
    label: string;
    dot: string;
    bg: string;
    text: string;
    border: string;
    desc: string;
  }
> = {
  draft: {
    label: "Draft",
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    desc: "Program ini tidak terlihat oleh publik. Selesaikan setup sebelum dipublikasikan.",
  },
  published: {
    label: "Published",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    desc: "Program aktif dan terlihat oleh publik.",
  },
  archived: {
    label: "Archived",
    dot: "bg-neutral-400",
    bg: "bg-neutral-100",
    text: "text-neutral-600",
    border: "border-neutral-200",
    desc: "Program diarsipkan dan tidak terlihat oleh publik.",
  },
};

export const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-red-50 text-red-700 border-red-200",
};

/* ─────────────────────────────────────────────────────────────
   FORMAT HELPERS
───────────────────────────────────────────────────────────── */

export function formatIDR(value: number | null | undefined): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDateFull(
  d: Date | string | null | undefined,
): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function formatDateShort(
  d: Date | string | null | undefined,
): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

/* ─────────────────────────────────────────────────────────────
   SECTION WRAPPER — the shared card shell for every section
───────────────────────────────────────────────────────────── */

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isEditing: boolean;
  isDirty?: boolean;
  isSubmitting?: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
  readOnly?: boolean;
}

export function SectionCard({
  icon,
  title,
  description,
  isEditing,
  isDirty = false,
  isSubmitting = false,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  children,
  readOnly = false,
}: SectionCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-neutral-100 bg-neutral-50/40">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <span className="text-neutral-500">{icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[13px] font-bold text-neutral-800 tracking-tight">
                {title}
              </h3>
              {readOnly && (
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-neutral-100 text-neutral-400 rounded-full border border-neutral-200">
                  Read only
                </span>
              )}
              {isEditing && isDirty && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-600 rounded-full px-2 py-0.5"
                >
                  Belum disimpan
                </motion.span>
              )}
            </div>
            <p className="text-[12px] text-neutral-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex-shrink-0 self-start">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-btns"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="h-7 px-2.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="size-3 mr-1" />
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSave}
                    disabled={isSubmitting || !isDirty}
                    className="h-7 px-3 text-[11px] font-semibold gap-1 rounded-lg"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3" />
                    )}
                    Simpan
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="read-btn"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={!canEdit}
                    className="h-7 px-2.5 text-[11px] font-medium rounded-lg gap-1.5 border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   READ FIELD — consistent read-mode display
───────────────────────────────────────────────────────────── */

interface ReadFieldProps {
  label: string;
  children?: React.ReactNode;
  empty?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function ReadField({
  label,
  children,
  empty,
  fullWidth,
  className,
}: ReadFieldProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        fullWidth && "col-span-2",
        className,
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-neutral-400">
        {label}
      </span>
      <div
        className={cn(
          "text-[13px] leading-relaxed",
          empty ? "text-neutral-300 italic" : "text-neutral-800",
        )}
      >
        {children ?? (
          <span className="text-neutral-300 italic">Belum diisi</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   META PILL
───────────────────────────────────────────────────────────── */

export function MetaPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        className ?? "bg-neutral-50 border-neutral-200 text-neutral-700",
      )}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   FORM FIELD WRAPPER
───────────────────────────────────────────────────────────── */

interface FieldWrapProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrap({
  label,
  hint,
  error,
  required,
  children,
  className,
}: FieldWrapProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-neutral-400">{hint}</p>}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-red-500 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INPUT PRIMITIVES
───────────────────────────────────────────────────────────── */

export const inputCls = cn(
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5",
  "text-[13px] text-neutral-800 placeholder:text-neutral-300",
  "outline-none transition-all duration-150",
  "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
  "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
);

export const textareaCls = cn(
  inputCls,
  "resize-none leading-relaxed min-h-[90px]",
);

/* ─────────────────────────────────────────────────────────────
   STICKY SAVE BAR
───────────────────────────────────────────────────────────── */

interface StickySaveBarProps {
  isDirty: boolean;
  isSubmitting: boolean;
  sectionTitle: string;
  onCancel: () => void;
  onSave: () => void;
}

export function StickySaveBar({
  isDirty,
  isSubmitting,
  sectionTitle,
  onCancel,
  onSave,
}: StickySaveBarProps) {
  return (
    <AnimatePresence>
      {isDirty && (
        <>
          {/* Desktop floating pill */}
          <motion.div
            key="desktop-bar"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex fixed bottom-6 right-6 z-50 items-center gap-2 rounded-2xl border border-neutral-200/80 bg-white/90 backdrop-blur-md px-4 py-2.5 shadow-xl shadow-black/10"
          >
            <div className="flex items-center gap-2 mr-2">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[12px] font-semibold text-neutral-600">
                {sectionTitle}
              </span>
              <ChevronRight className="size-3 text-neutral-300" />
              <span className="text-[12px] text-amber-600 font-semibold">
                Belum disimpan
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-7 px-2.5 text-[11px]"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSubmitting}
              className="h-7 px-3 text-[11px] gap-1.5 rounded-lg"
            >
              {isSubmitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              Simpan perubahan
            </Button>
          </motion.div>

          {/* Mobile bottom bar */}
          <motion.div
            key="mobile-bar"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 border-t border-neutral-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_-8px_24px_0_rgba(0,0,0,0.07)]"
          >
            <span className="flex items-center gap-1.5 text-[12px] text-amber-600 font-semibold flex-1">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Belum disimpan
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSubmitting}
              className="h-8 text-xs gap-1.5 rounded-lg"
            >
              {isSubmitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              Simpan
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────
   INFO NOTICE
───────────────────────────────────────────────────────────── */

export function InfoNotice({
  icon,
  children,
  variant = "info",
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: "info" | "warn" | "success";
}) {
  const styles = {
    info: "bg-blue-50 border-blue-100 text-blue-700",
    warn: "bg-amber-50 border-amber-100 text-amber-700",
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
  };
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-[12px] leading-relaxed",
        styles[variant],
      )}
    >
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────────────────────────── */

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="h-px flex-1 bg-neutral-100" />
      <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-neutral-300">
        {label}
      </span>
      <div className="h-px flex-1 bg-neutral-100" />
    </div>
  );
}
