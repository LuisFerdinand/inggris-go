// app/(dashboard)/dashboard/settings/home-programs/_modules/fields.tsx
"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { ShowcaseTemplate } from "@/app/modules/site-content/site-content.types";
import { SHOWCASE_TEMPLATES } from "@/app/modules/site-content/program-showcase.templates";

/** Native select styled like the other CMS inputs. */
export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none transition-colors focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** One item per line. Keeps raw text while typing so Enter works naturally. */
export function LinesField({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  const key = value.join("\n");
  const [draft, setDraft] = useState(key);

  useEffect(() => {
    // Only overwrite the draft when the change came from outside.
    setDraft((d) =>
      d
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n") === key
        ? d
        : key,
    );
  }, [key]);

  return (
    <textarea
      value={draft}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        );
      }}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
    />
  );
}

/* ── template thumbnails ───────────────────────────────────── */

function Wire({ template }: { template: ShowcaseTemplate }) {
  const dark = "bg-indigo-800";
  const soft = "bg-slate-200";
  const gold = "bg-amber-400";

  if (template === "feature") {
    return (
      <div className={cn("flex h-full gap-1.5 rounded-md p-1.5", dark)}>
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 w-8 rounded bg-white/70" />
          <div className="h-1 w-full rounded bg-white/40" />
          <div className="h-1 w-3/4 rounded bg-white/40" />
          <div className="mt-auto grid grid-cols-2 gap-1">
            <div className="h-2 rounded bg-white/25" />
            <div className="h-2 rounded bg-white/25" />
          </div>
        </div>
        <div className="flex w-1/3 flex-col gap-1 rounded bg-white p-1">
          <div className="h-1 w-3/4 rounded bg-slate-300" />
          <div className="h-2 w-full rounded bg-indigo-700" />
          <div className={cn("mt-auto h-2 rounded-full", gold)} />
        </div>
      </div>
    );
  }
  if (template === "cards") {
    return (
      <div className="flex h-full gap-1 rounded-md bg-slate-100 p-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "flex flex-1 flex-col gap-1 rounded bg-white p-1",
              i === 0 && "ring-1 ring-indigo-700",
            )}
          >
            <div className="h-1 w-3/4 rounded bg-slate-300" />
            <div className="h-2 w-full rounded bg-indigo-700" />
            <div className={cn("h-1 w-full", soft)} />
            <div className="mt-auto h-1.5 rounded-full bg-indigo-200" />
          </div>
        ))}
      </div>
    );
  }
  if (template === "spotlight") {
    return (
      <div className="flex h-full gap-1.5 rounded-md border border-slate-200 bg-white p-1.5">
        <div className="w-2/5 rounded bg-slate-200" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 w-3/4 rounded bg-indigo-700" />
          <div className="h-1 w-full rounded bg-slate-200" />
          <div className="grid grid-cols-3 gap-0.5">
            <div className="h-2 rounded bg-indigo-100" />
            <div className="h-2 rounded bg-indigo-100" />
            <div className="h-2 rounded bg-indigo-100" />
          </div>
          <div className="mt-auto flex gap-1">
            <div className={cn("h-2 w-1/2 rounded-full", gold)} />
            <div className="h-2 w-1/3 rounded-full border border-indigo-700" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={cn("flex h-full flex-col gap-1 rounded-md p-1.5", dark)}>
      <div className="h-2 w-3/4 rounded bg-amber-400" />
      <div className="h-1 w-full rounded bg-white/40" />
      <div className="mt-0.5 grid grid-cols-3 gap-1">
        <div className="h-3 rounded bg-white/20" />
        <div className="h-3 rounded bg-white/20" />
        <div className="h-3 rounded bg-white/20" />
      </div>
      <div className={cn("mt-auto h-2 w-1/3 rounded-full", gold)} />
    </div>
  );
}

/** Visual chooser of the four layouts. */
export function TemplatePicker({
  value,
  onChange,
  compact = false,
}: {
  value: ShowcaseTemplate | null;
  onChange: (t: ShowcaseTemplate) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-3", compact ? "sm:grid-cols-4" : "sm:grid-cols-2")}>
      {SHOWCASE_TEMPLATES.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all",
              active
                ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-100"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <div className="h-16 w-full">
              <Wire template={t.value} />
            </div>
            <div>
              <p className="text-[12.5px] font-black text-slate-800">{t.title}</p>
              {!compact && (
                <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">
                  {t.description}
                </p>
              )}
              <p className="mt-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                {t.source}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
