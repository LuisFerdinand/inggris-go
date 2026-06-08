// app/(dashboard)/dashboard/programs/create/ContentCreateSection.tsx
"use client";

import { useState } from "react";
import { ChevronDown, LayoutTemplate } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Single source of truth for section labels/icons/order.
import { SECTION_META } from "../[programId]/_modules/tabs/content/registry";

interface ContentCreateSectionProps {
  /** selected section *types* (e.g. "hero", "pricing") */
  value: Set<string>;
  onChange: (next: Set<string>) => void;
  defaultExpanded?: boolean;
}

const ACCENT = "#4f46e5"; // indigo

export function ContentCreateSection({
  value,
  onChange,
  defaultExpanded = true,
}: ContentCreateSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  function toggle(type: string) {
    const next = new Set(value);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    onChange(next);
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
      style={{ borderLeftColor: ACCENT, borderLeftWidth: 3 }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className={cn(
          "group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors duration-150",
          expanded
            ? "border-b border-indigo-100 bg-indigo-50/60"
            : "hover:bg-neutral-50/60",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <LayoutTemplate className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              04
            </span>
            <h2 className="text-sm font-bold text-neutral-800">
              Konten Landing Page
            </h2>
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
              {value.size} dipilih
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-400">
            Pilih section yang akan tampil di halaman publik program
          </p>
        </div>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-neutral-400 transition-transform duration-200 group-hover:text-neutral-600",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Body */}
      {expanded && (
        <div className="flex flex-col gap-4 px-6 py-4 sm:px-8">
          <p className="text-xs leading-relaxed text-neutral-400">
            Section yang dipilih akan dibuat sebagai template kosong dan aktif.
            Kamu bisa menambah, mengisi, mengurutkan, atau menonaktifkannya kapan
            saja di tab <span className="font-semibold">Konten</span> setelah
            program dibuat.
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SECTION_META.map((m) => {
              const on = value.has(m.type);
              const Icon = m.icon;
              return (
                <div
                  key={m.type}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle(m.type)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(m.type);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    on
                      ? "border-indigo-200 bg-indigo-50/50"
                      : "border-neutral-200 bg-white hover:border-neutral-300",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                      on
                        ? "border-indigo-200 bg-white text-indigo-600"
                        : "border-neutral-200 bg-neutral-50 text-neutral-400",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-neutral-700">
                      {m.label}
                    </p>
                    <p className="truncate text-[11px] text-neutral-400">
                      {m.description}
                    </p>
                  </div>

                  <Switch
                    checked={on}
                    onCheckedChange={() => toggle(m.type)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}