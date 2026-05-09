"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteHeader } from "@/components/sidebar/site-header";
import { Button } from "@/components/ui/button";
import { ProgramCreateInput, programCreateSchema } from "@/lib/zodSchemas";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Info,
  Layers,
  LayoutDashboard,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  Award,
  Archive,
  X,
  Zap,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  useForm,
  Controller,
  useFieldArray,
  Resolver,
  UseFormReturn,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { trpc } from "@/lib/trpc/client";
import {} from "@/app/(home)/programs/[categorySlug]/data";
type FormValues = z.infer<typeof programCreateSchema>;

type SectionId = "basic" | "details" | "pricing" | "media";

type Category = { id: string; label: string; icon?: string | null };

type SectionConfig = {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: {
    accent: string;
    bg: string; // card header bg (tailwind)
    border: string; // card border (tailwind)
    pill: string; // pill bg+text for active nav
    iconBg: string; // icon wrapper bg
    iconText: string; // icon color
    badgeBg: string; // snippet badge bg
    badgeText: string; // snippet badge text
    dividerBg: string; // section divider bg
    dividerBorder: string; // section divider border
    checkBg: string; // completed check bg
    checkText: string; // completed check icon color
  };
};

/* ─── Section Config ─────────────────────────────────────────── */
const SECTIONS: SectionConfig[] = [
  {
    id: "basic",
    label: "Basic Info",
    icon: <FileText className="size-4" />,
    description: "Title, description & category",
    color: {
      accent: "#3b82f6",
      bg: "bg-blue-50/40",
      border: "border-blue-100",
      pill: "bg-blue-600 text-white shadow-blue-600/30",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      badgeBg: "bg-blue-50 border border-blue-100",
      badgeText: "text-blue-700",
      dividerBg: "bg-blue-50/60",
      dividerBorder: "border-blue-100",
      checkBg: "bg-blue-50",
      checkText: "text-blue-600",
    },
  },
  {
    id: "details",
    label: "Details",
    icon: <Layers className="size-4" />,
    description: "Format, level & duration",
    color: {
      accent: "#14b8a6",
      bg: "bg-teal-50/40",
      border: "border-teal-100",
      pill: "bg-teal-600 text-white shadow-teal-600/30",
      iconBg: "bg-teal-100",
      iconText: "text-teal-600",
      badgeBg: "bg-teal-50 border border-teal-100",
      badgeText: "text-teal-700",
      dividerBg: "bg-teal-50/60",
      dividerBorder: "border-teal-100",
      checkBg: "bg-teal-50",
      checkText: "text-teal-600",
    },
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: <DollarSign className="size-4" />,
    description: "Pricing model & tiers",
    color: {
      accent: "#f59e0b",
      bg: "bg-amber-50/40",
      border: "border-amber-100",
      pill: "bg-amber-500 text-white shadow-amber-500/30",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      badgeBg: "bg-amber-50 border border-amber-100",
      badgeText: "text-amber-700",
      dividerBg: "bg-amber-50/60",
      dividerBorder: "border-amber-100",
      checkBg: "bg-amber-50",
      checkText: "text-amber-600",
    },
  },
  {
    id: "media",
    label: "Media & Tags",
    icon: <ImageIcon className="size-4" />,
    description: "Thumbnail, icon & tags",
    color: {
      accent: "#8b5cf6",
      bg: "bg-purple-50/40",
      border: "border-purple-100",
      pill: "bg-purple-600 text-white shadow-purple-600/30",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
      badgeBg: "bg-purple-50 border border-purple-100",
      badgeText: "text-purple-700",
      dividerBg: "bg-purple-50/60",
      dividerBorder: "border-purple-100",
      checkBg: "bg-purple-50",
      checkText: "text-purple-600",
    },
  },
];

const FORMAT_OPTIONS = [
  {
    value: "online",
    label: "Online",
    icon: <Globe className="size-5" />,
    desc: "Fully remote, anytime access",
  },
  {
    value: "offline",
    label: "In-person",
    icon: <BookOpen className="size-5" />,
    desc: "Classroom based learning",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    icon: <Zap className="size-5" />,
    desc: "Blended online & in-person",
  },
];

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner", dot: "bg-emerald-500" },
  { value: "intermediate", label: "Intermediate", dot: "bg-amber-500" },
  { value: "advanced", label: "Advanced", dot: "bg-red-500" },
  { value: "all", label: "All Levels", dot: "bg-blue-500" },
];

const STATUS_OPTIONS = [
  {
    value: "draft",
    label: "Draft",
    icon: <LayoutDashboard className="size-4" />,
    desc: "Only visible to you",
  },
  {
    value: "published",
    label: "Published",
    icon: <Eye className="size-4" />,
    desc: "Visible to all learners",
  },
  {
    value: "archived",
    label: "Archived",
    icon: <Archive className="size-4" />,
    desc: "Hidden from listings",
  },
];

/* ─── Shared input styles ────────────────────────────────────── */
const baseInput =
  "h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all outline-none " +
  "placeholder:text-neutral-400 border-neutral-200 hover:border-neutral-300 " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ";

const errorInput = "border-red-400 focus:border-red-500 focus:ring-red-500/10 ";

/* ─── Field ──────────────────────────────────────────────────── */
function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-neutral-700 leading-none"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500 font-normal" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

/* ─── Input ──────────────────────────────────────────────────── */
function Input({
  invalid,
  className,
  value,
  onChange,
  ...props
}: React.ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid}
      value={value ?? ""}
      onChange={onChange}
      className={cn(baseInput, invalid && errorInput, className)}
    />
  );
}

/* ─── Textarea ───────────────────────────────────────────────── */
function Textarea({
  invalid,
  className,
  ...props
}: React.ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid}
      className={cn(
        "w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-all outline-none resize-none",
        "placeholder:text-neutral-400 border-neutral-200 hover:border-neutral-300",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10",
        invalid && errorInput,
        className,
      )}
    />
  );
}

/* ─── CurrencyInput ──────────────────────────────────────────── */
function CurrencyInput({
  invalid,
  value,
  onChange,
  name,
  onBlur,
  id,
  ...rest
}: React.ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-neutral-400 select-none z-10">
        Rp
      </span>
      <input
        {...rest}
        id={id}
        name={name}
        onBlur={onBlur}
        type="number"
        min="0"
        aria-invalid={invalid}
        value={value ?? ""}
        onChange={onChange}
        className={cn(
          baseInput,
          "pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          invalid && errorInput,
        )}
      />
    </div>
  );
}

/* ─── TagInput ───────────────────────────────────────────────── */
function TagInput({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) {
      onChange([...value, t]);
      setDraft("");
    }
  };
  return (
    <div className="flex min-h-[2.5rem] w-full flex-wrap gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
        >
          <Tag className="size-2.5 shrink-0" />
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-2.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length)
            onChange(value.slice(0, -1));
        }}
        placeholder={value.length === 0 ? "Type a tag, then press Enter" : ""}
        className="flex-1 min-w-28 bg-transparent outline-none placeholder:text-neutral-400 text-sm"
      />
    </div>
  );
}

/* ─── Section Divider (internal, colored) ────────────────────── */
function SectionDivider({
  id,
  icon,
  title,
  description,
  color,
}: {
  id: SectionId;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: SectionConfig["color"];
}) {
  return (
    <div
      id={`section-${id}`}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-5 py-4 scroll-mt-24",
        color.dividerBg,
        color.dividerBorder,
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg shadow-sm",
          color.iconBg,
        )}
      >
        <span className={color.iconText}>{icon}</span>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

/* ─── Sidebar nav ────────────────────────────────────────────── */
function SideNav({
  activeSection,
  sectionErrors,
  completedSections,
  expandedSections,
  onNavigate,
}: {
  activeSection: SectionId;
  sectionErrors: Record<SectionId, boolean>;
  completedSections: Set<SectionId>;
  expandedSections: Set<SectionId>;
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {SECTIONS.map((s) => {
        const isActive = activeSection === s.id;
        const hasError = sectionErrors[s.id];
        const isDone = completedSections.has(s.id) && !hasError;
        const isExpanded = expandedSections.has(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onNavigate(s.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 w-full group",
              isActive ? "bg-neutral-100" : "hover:bg-neutral-50",
            )}
          >
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md transition-all",
                isActive
                  ? cn(s.color.iconBg, s.color.iconText)
                  : hasError
                    ? "bg-red-50 text-red-500"
                    : isDone
                      ? cn(s.color.checkBg, s.color.checkText)
                      : "bg-neutral-100 text-neutral-400",
              )}
            >
              {isDone && !isActive ? (
                <Check className="size-3.5" strokeWidth={2.5} />
              ) : hasError && !isActive ? (
                <AlertCircle className="size-3.5" />
              ) : (
                s.icon
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-xs font-semibold leading-none",
                  isActive
                    ? "text-neutral-800"
                    : hasError
                      ? "text-red-600"
                      : "text-neutral-600",
                )}
              >
                {s.label}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5 leading-none">
                {s.description}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!isExpanded && (
                <span className="text-[9px] text-neutral-300 font-medium uppercase tracking-wide">
                  collapsed
                </span>
              )}
              {isActive && (
                <ChevronRight className="size-3.5 text-neutral-400" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────────── */
function ProgressBar({ form }: { form: UseFormReturn<FormValues> }) {
  const title = form.watch("title") || "";
  const description = form.watch("description") || "";
  const categoryId = form.watch("categoryId") || "";
  const format = form.watch("format") || "";
  const level = form.watch("level") || "";
  const status = form.watch("status") || "";

  const fields = [title, description, categoryId, format, level, status];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);

  const color =
    pct < 34
      ? "bg-red-400"
      : pct < 67
        ? "bg-amber-400"
        : pct < 100
          ? "bg-blue-500"
          : "bg-emerald-500";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Completion
        </p>
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            pct === 100 ? "text-emerald-600" : "text-neutral-600",
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && (
        <p className="mt-2 text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 className="size-3" /> All key fields filled
        </p>
      )}
    </div>
  );
}

/* ─── Section snippet (collapsed preview) ────────────────────── */
function SectionSnippet({
  id,
  form,
  color,
  categories,
}: {
  id: SectionId;
  form: UseFormReturn<FormValues>;
  color: SectionConfig["color"];
  categories: Category[];
}) {
  const snippets: Record<
    SectionId,
    { label: string; value: string | undefined }[]
  > = {
    basic: [
      { label: "Title", value: (form.watch("title") as string) || undefined },
      {
        label: "Category",
        value: categories.find((c) => c.id === form.watch("categoryId"))?.label,
      },
      { label: "Status", value: (form.watch("status") as string) || undefined },
    ],
    details: [
      {
        label: "Format",
        value: FORMAT_OPTIONS.find((f) => f.value === form.watch("format"))
          ?.label,
      },
      {
        label: "Level",
        value: LEVEL_OPTIONS.find((l) => l.value === form.watch("level"))
          ?.label,
      },
      {
        label: "Duration",
        value: form.watch("duration")
          ? `${form.watch("duration")} hrs`
          : undefined,
      },
    ],
    pricing: [
      {
        label: "Base Price",
        value: form.watch("basePrice")
          ? `Rp ${Number(form.watch("basePrice")).toLocaleString("id-ID")}`
          : undefined,
      },
      {
        label: "Tiers",
        value:
          (form.watch("priceTiers")?.length ?? 0) > 0
            ? `${form.watch("priceTiers")?.length} tier(s)`
            : undefined,
      },
    ],
    media: [
      {
        label: "Thumbnail",
        value: form.watch("thumbnail") ? "Set" : undefined,
      },
      {
        label: "Tags",
        value:
          (form.watch("tags")?.length ?? 0) > 0
            ? `${form.watch("tags")?.length} tag(s)`
            : undefined,
      },
    ],
  };

  const items = snippets[id].filter((i) => i.value);

  if (items.length === 0) {
    return (
      <p className="text-xs text-neutral-400 italic px-6 pb-4">
        No fields filled yet — expand to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 px-6 pb-4">
      {items.map((item) => (
        <span
          key={item.label}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            color.badgeBg,
            color.badgeText,
          )}
        >
          <span className="opacity-60">{item.label}:</span>
          <span className="font-semibold">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

/* ─── Collapsible Section Card ───────────────────────────────── */
function SectionCard({
  section,
  isExpanded,
  hasError,
  isComplete,
  onToggle,
  children,
  form,
  categories,
}: {
  section: SectionConfig;
  isExpanded: boolean;
  hasError: boolean;
  isComplete: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  form: UseFormReturn<FormValues>;
  categories: Category[];
}) {
  const { color } = section;
  const borderColor = hasError
    ? "#ef4444"
    : isComplete
      ? "#22c55e"
      : color.accent;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm overflow-hidden transition-all duration-200",
        hasError
          ? "border-red-200"
          : isComplete
            ? "border-green-100"
            : "border-neutral-200",
      )}
      style={{ borderLeftColor: borderColor, borderLeftWidth: 4 }}
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-4 px-6 py-4 text-left transition-colors duration-150 group",
          isExpanded
            ? cn(color.bg, "border-b", color.border)
            : "hover:bg-neutral-50/60",
        )}
        aria-expanded={isExpanded}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
            hasError
              ? "bg-red-50 text-red-500"
              : isComplete
                ? "bg-emerald-50 text-emerald-600"
                : cn(color.iconBg, color.iconText),
          )}
        >
          {hasError ? (
            <AlertCircle className="size-4" />
          ) : isComplete ? (
            <Check className="size-4" strokeWidth={2.5} />
          ) : (
            section.icon
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                "text-sm font-bold",
                hasError
                  ? "text-red-700"
                  : isComplete
                    ? "text-emerald-700"
                    : "text-neutral-800",
              )}
            >
              {section.label}
            </h2>
            {hasError && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-600 rounded px-1.5 py-0.5">
                Needs attention
              </span>
            )}
            {isComplete && !hasError && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-600 rounded px-1.5 py-0.5">
                Complete
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {section.description}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "size-4 text-neutral-400 shrink-0 transition-transform duration-200 group-hover:text-neutral-600",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      {/* Collapsed snippet */}
      {!isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <SectionSnippet
            id={section.id}
            form={form}
            color={color}
            categories={categories}
          />
        </div>
      )}

      {/* Expanded body */}
      {isExpanded && (
        <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

function BasicSection({
  form,
  color,
  categories,
  isLoadingCategories,
}: {
  form: UseFormReturn<FormValues>;
  color: SectionConfig["color"];
  categories: Category[];
  isLoadingCategories: boolean;
}) {
  const title = (form.watch("title") ?? "") as string;
  const desc = (form.watch("description") ?? "") as string;
  const shortDesc = (form.watch("shortDesc") ?? "") as string;

  return (
    <div className="flex flex-col gap-5">
      <SectionDivider
        id="basic"
        icon={<FileText className="size-4" />}
        title="Basic Information"
        description="Name, describe, and categorise your program"
        color={color}
      />

      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field
            label="Program Title"
            htmlFor="f-title"
            required
            hint="3–120 characters. Be specific and outcome-focused."
            error={fieldState.error?.message}
          >
            <div className="relative">
              <Input
                {...field}
                id="f-title"
                placeholder="e.g. Full-Stack Web Development Bootcamp"
                invalid={fieldState.invalid}
                maxLength={120}
              />
              <span
                className={cn(
                  "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums",
                  title.length > 110
                    ? "text-red-500 font-medium"
                    : "text-neutral-300",
                )}
              >
                {title.length}/120
              </span>
            </div>
          </Field>
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field
            label="Full Description"
            htmlFor="f-desc"
            required
            hint="Describe outcomes, prerequisites, and what makes this program unique."
            error={fieldState.error?.message}
          >
            <div className="relative">
              <Textarea
                {...field}
                id="f-desc"
                rows={5}
                placeholder="What will learners achieve? What do they need to get started?"
                invalid={fieldState.invalid}
              />
              <span className="pointer-events-none absolute right-3 bottom-3 text-xs text-neutral-300 tabular-nums">
                {desc.length} chars
              </span>
            </div>
          </Field>
        )}
      />

      <Controller
        name="shortDesc"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field
            label="Short Description"
            htmlFor="f-short"
            hint="Shown on program cards — one punchy sentence (max 200 chars)."
            error={fieldState.error?.message}
          >
            <div className="relative">
              <Textarea
                {...field}
                id="f-short"
                rows={2}
                placeholder="One compelling sentence that makes learners want to enrol…"
                invalid={fieldState.invalid}
                maxLength={200}
              />
              <span
                className={cn(
                  "pointer-events-none absolute right-3 bottom-3 text-xs tabular-nums",
                  shortDesc.length > 180
                    ? "text-amber-500 font-medium"
                    : "text-neutral-300",
                )}
              >
                {shortDesc.length}/200
              </span>
            </div>
          </Field>
        )}
      />

      <Controller
        name="categoryId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field label="Category" required error={fieldState.error?.message}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {isLoadingCategories ? (
                // ✅ Skeleton Loader (matches card UI)
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[42px] rounded-lg border border-neutral-200 bg-neutral-100 animate-pulse"
                  />
                ))
              ) : categories && categories.length > 0 ? (
                // ✅ Normal State
                categories.map((cat) => {
                  const sel = field.value === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => field.onChange(cat.id)}
                      disabled={isLoadingCategories}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-all duration-150",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                        sel
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 text-neutral-600",
                        fieldState.invalid && !field.value && "border-red-300",
                        isLoadingCategories && "opacity-60 cursor-not-allowed",
                      )}
                    >
                      <span className="flex-1 truncate text-xs font-medium">
                        {cat.label}
                      </span>

                      {sel && (
                        <Check
                          className="size-3.5 shrink-0 text-blue-600"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                // ✅ Empty State
                <div className="col-span-full text-xs text-neutral-500 border border-dashed border-neutral-300 rounded-lg p-3 text-center">
                  Tidak ada kategori tersedia
                </div>
              )}
            </div>
          </Field>
        )}
      />

      <Controller
        name="status"
        control={form.control}
        render={({ field }) => (
          <Field
            label="Publication Status"
            hint="You can always change this later."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {STATUS_OPTIONS.map((opt) => {
                const sel = field.value === opt.value;
                const statusColors: Record<string, string> = {
                  draft: sel ? "border-neutral-400 bg-neutral-50" : "",
                  published: sel ? "border-emerald-400 bg-emerald-50" : "",
                  archived: sel ? "border-orange-400 bg-orange-50" : "",
                };
                const iconColors: Record<string, string> = {
                  draft: sel
                    ? "bg-neutral-700 text-white"
                    : "bg-neutral-100 text-neutral-500",
                  published: sel
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-600",
                  archived: sel
                    ? "bg-orange-600 text-white"
                    : "bg-orange-50 text-orange-600",
                };
                const labelColors: Record<string, string> = {
                  draft: sel ? "text-neutral-800" : "text-neutral-600",
                  published: sel ? "text-emerald-800" : "text-neutral-600",
                  archived: sel ? "text-orange-800" : "text-neutral-600",
                };
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-150",
                      sel
                        ? statusColors[opt.value]
                        : "border-neutral-200 bg-white hover:bg-neutral-50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md transition-all",
                        iconColors[opt.value],
                      )}
                    >
                      {opt.icon}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          labelColors[opt.value],
                        )}
                      >
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                    {sel && (
                      <div className="absolute top-2 right-2 size-4 flex items-center justify-center rounded-full bg-current/10">
                        <Check
                          className="size-2.5 text-current"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="badge"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label="Badge"
              htmlFor="f-badge"
              hint='Chip on the card, e.g. "Bestseller"'
              error={fieldState.error?.message}
            >
              <div className="relative">
                <Award className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                <Input
                  {...field}
                  id="f-badge"
                  placeholder="Bestseller"
                  maxLength={50}
                  invalid={fieldState.invalid}
                  className="pl-8"
                />
              </div>
            </Field>
          )}
        />
        <Controller
          name="highlight"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label="Highlight"
              htmlFor="f-highlight"
              hint="Short selling point below the title"
              error={fieldState.error?.message}
            >
              <div className="relative">
                <TrendingUp className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                <Input
                  {...field}
                  id="f-highlight"
                  placeholder="Certificate included"
                  maxLength={160}
                  invalid={fieldState.invalid}
                  className="pl-8"
                />
              </div>
            </Field>
          )}
        />
      </div>
    </div>
  );
}

function DetailsSection({
  form,
  color,
}: {
  form: UseFormReturn<FormValues>;
  color: SectionConfig["color"];
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionDivider
        id="details"
        icon={<Layers className="size-4" />}
        title="Program Details"
        description="Format, difficulty level, and time commitment"
        color={color}
      />

      <Controller
        name="format"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field
            label="Delivery Format"
            required
            error={fieldState.error?.message}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FORMAT_OPTIONS.map((opt) => {
                const sel = field.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      "relative flex flex-col gap-2.5 rounded-lg border px-4 py-3.5 text-left transition-all duration-150",
                      sel
                        ? "border-teal-500 bg-teal-50"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg transition-all",
                        sel
                          ? "bg-teal-100 text-teal-700"
                          : "bg-neutral-100 text-neutral-400",
                      )}
                    >
                      {opt.icon}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          sel ? "text-teal-800" : "text-neutral-700",
                        )}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                    {sel && (
                      <Check
                        className="absolute top-3 right-3 size-4 text-teal-600"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
      />

      <Controller
        name="level"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field
            label="Difficulty Level"
            required
            error={fieldState.error?.message}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LEVEL_OPTIONS.map((opt) => {
                const sel = field.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg border px-3 py-3 text-left transition-all duration-150",
                      sel
                        ? "border-teal-500 bg-teal-50"
                        : "border-neutral-200 bg-white hover:border-neutral-300",
                    )}
                  >
                    <span
                      className={cn("size-2 shrink-0 rounded-full", opt.dot)}
                    />
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        sel ? "text-teal-700" : "text-neutral-600",
                      )}
                    >
                      {opt.label}
                    </span>
                    {sel && (
                      <Check
                        className="absolute top-2 right-2 size-3 text-teal-500"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="duration"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label="Duration"
              htmlFor="f-dur"
              hint="Total content hours (optional)"
              error={fieldState.error?.message}
            >
              <div className="relative">
                <input
                  id="f-dur"
                  type="number"
                  min="0"
                  placeholder="0"
                  name={field.name}
                  ref={field.ref}
                  value={(field.value as number | undefined) ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    baseInput,
                    "pr-16",
                    fieldState.invalid && errorInput,
                  )}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 border-l border-neutral-200 px-3">
                  <Clock className="size-3 text-neutral-400" />
                  <span className="text-xs text-neutral-400">hrs</span>
                </div>
              </div>
            </Field>
          )}
        />
        <Controller
          name="order"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label="Sort Order"
              htmlFor="f-ord"
              hint="Lower number = appears first in listings"
              error={fieldState.error?.message}
            >
              <input
                id="f-ord"
                type="number"
                min="0"
                placeholder="0"
                name={field.name}
                ref={field.ref}
                value={(field.value as number | undefined) ?? ""}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? "" : e.target.value)
                }
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
                className={cn(baseInput, fieldState.invalid && errorInput)}
              />
            </Field>
          )}
        />
      </div>
    </div>
  );
}

function PricingSection({
  form,
  color,
}: {
  form: UseFormReturn<FormValues>;
  color: SectionConfig["color"];
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "priceTiers",
  });
  const [mode, setMode] = useState<"free" | "single" | "tiers">("single");

  const rawBp = form.watch("basePrice");
  const rawOp = form.watch("originalPrice");
  const bp = rawBp ?? undefined;
  const op = rawOp ?? undefined;
  const discount =
    bp !== undefined && op !== undefined && op > bp
      ? Math.round(((op - bp) / op) * 100)
      : null;

  const modeOptions = [
    {
      id: "free" as const,
      label: "Free",
      sub: "No charge",
      icon: <Users className="size-4" />,
    },
    {
      id: "single" as const,
      label: "Fixed Price",
      sub: "One price",
      icon: <DollarSign className="size-4" />,
    },
    {
      id: "tiers" as const,
      label: "Price Tiers",
      sub: "Multiple tiers",
      icon: <Layers className="size-4" />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SectionDivider
        id="pricing"
        icon={<DollarSign className="size-4" />}
        title="Pricing"
        description="Choose a pricing model that works for your program"
        color={color}
      />

      <div className="grid grid-cols-3 gap-2">
        {modeOptions.map((m) => {
          const sel = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border py-4 px-2 text-center transition-all duration-150",
                sel
                  ? "border-amber-500 bg-amber-50"
                  : "border-neutral-200 bg-white hover:bg-neutral-50",
              )}
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-md transition-all",
                  sel
                    ? "bg-amber-100 text-amber-700"
                    : "bg-neutral-100 text-neutral-400",
                )}
              >
                {m.icon}
              </div>
              <div>
                <p
                  className={cn(
                    "text-xs font-semibold",
                    sel ? "text-amber-800" : "text-neutral-600",
                  )}
                >
                  {m.label}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{m.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {mode === "free" && (
        <div className="flex items-center gap-4 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 animate-in fade-in duration-200">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <GraduationCap className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Free Access
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              This program will be publicly available at no cost to all
              learners.
            </p>
          </div>
        </div>
      )}

      {mode === "single" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <Info className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Set an <strong>Original Price</strong> and a lower{" "}
              <strong>Sale Price</strong> to display a discount badge.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="originalPrice"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  label="Original Price"
                  htmlFor="f-op"
                  hint="The regular crossed-out price"
                  error={fieldState.error?.message}
                >
                  <CurrencyInput
                    id="f-op"
                    placeholder="500,000"
                    invalid={fieldState.invalid}
                    name={field.name}
                    ref={field.ref}
                    value={(field.value as number | undefined) ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : e.target.value,
                      )
                    }
                    onBlur={field.onBlur}
                  />
                </Field>
              )}
            />
            <Controller
              name="basePrice"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  label="Sale Price"
                  htmlFor="f-bp"
                  hint="The actual price learners pay"
                  error={fieldState.error?.message}
                >
                  <CurrencyInput
                    id="f-bp"
                    placeholder="299,000"
                    invalid={fieldState.invalid}
                    name={field.name}
                    ref={field.ref}
                    value={(field.value as number | undefined) ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : e.target.value,
                      )
                    }
                    onBlur={field.onBlur}
                  />
                </Field>
              )}
            />
          </div>
          {discount !== null && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <Sparkles className="size-3.5 text-emerald-600 shrink-0" />
              <span className="text-sm font-bold text-emerald-700">
                {discount}% off
              </span>
              <span className="text-xs text-emerald-600">
                Rp {op!.toLocaleString("id-ID")}
                <span className="mx-1.5 font-semibold">→</span>Rp{" "}
                {bp!.toLocaleString("id-ID")}
              </span>
              <span className="ml-auto text-xs text-emerald-500">
                Saves Rp {(op! - bp!).toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>
      )}

      {mode === "tiers" && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-200">
          <p className="text-xs text-neutral-500">
            Create tiers for different access levels — Basic, Pro, Premium, etc.
          </p>
          {fields.map((f, idx) => (
            <div
              key={f.id}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Tier {idx + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="flex size-7 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Controller
                  name={`priceTiers.${idx}.label`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field label="Label" error={fieldState.error?.message}>
                      <Input
                        {...field}
                        placeholder="Pro"
                        invalid={fieldState.invalid}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`priceTiers.${idx}.price`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field label="Price" error={fieldState.error?.message}>
                      <CurrencyInput
                        placeholder="299,000"
                        invalid={fieldState.invalid}
                        name={field.name}
                        ref={field.ref}
                        value={(field.value as number | undefined) ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : e.target.value,
                          )
                        }
                        onBlur={field.onBlur}
                      />
                    </Field>
                  )}
                />
              </div>
              <Controller
                name={`priceTiers.${idx}.description`}
                control={form.control}
                render={({ field }) => (
                  <Field label="Included features (optional)">
                    <Input
                      {...field}
                      placeholder="Full access, certificate, 1-on-1 mentoring…"
                    />
                  </Field>
                )}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ label: "", price: 0, description: "" })}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 p-4 text-sm font-medium text-neutral-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50/50 transition-all duration-150 group"
          >
            <Plus className="size-4 group-hover:scale-110 transition-transform duration-150" />
            Add Pricing Tier
          </button>
        </div>
      )}
    </div>
  );
}

function MediaSection({
  form,
  color,
}: {
  form: UseFormReturn<FormValues>;
  color: SectionConfig["color"];
}) {
  const thumbnail = (form.watch("thumbnail") ?? "") as string;
  const icon = (form.watch("icon") ?? "") as string;
  const tags = form.watch("tags") ?? [];

  return (
    <div className="flex flex-col gap-5">
      <SectionDivider
        id="media"
        icon={<ImageIcon className="size-4" />}
        title="Media & Tags"
        description="Visuals and tags that help your program stand out"
        color={color}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="thumbnail"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label="Thumbnail URL"
              htmlFor="f-thumb"
              hint="1280×720 (16:9) recommended"
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="f-thumb"
                type="url"
                placeholder="https://…/thumbnail.jpg"
                invalid={fieldState.invalid}
              />
              {thumbnail && !fieldState.invalid && (
                <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200 aspect-video bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail}
                    alt="Thumbnail preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </Field>
          )}
        />
        <Controller
          name="icon"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              label="Icon URL"
              htmlFor="f-icon"
              hint="Square, min 128×128px"
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                id="f-icon"
                type="url"
                placeholder="https://…/icon.png"
                invalid={fieldState.invalid}
              />
              {icon && !fieldState.invalid && (
                <div className="mt-2 flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={icon}
                    alt="Icon preview"
                    className="size-10 rounded-lg border border-neutral-200 object-cover bg-neutral-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-xs text-neutral-400">Icon preview</span>
                </div>
              )}
            </Field>
          )}
        />
      </div>

      <Controller
        name="tags"
        control={form.control}
        render={({ field }) => (
          <Field
            label="Tags"
            hint="Press Enter or comma to add. Helps learners find your program."
          >
            <TagInput value={field.value} onChange={field.onChange} />
            {(tags.length ?? 0) > 0 && (
              <p className="text-xs text-neutral-400">
                {tags.length} tag{tags.length !== 1 ? "s" : ""} added
              </p>
            )}
          </Field>
        )}
      />
    </div>
  );
}

const ProgramCreatePage = () => {
  const { data: categories = [], isLoading: isLoadingCategories } =
    trpc.programs.getCategories.useQuery();

  const [activeSection, setActiveSection] = useState<SectionId>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<SectionId>>(
    new Set(),
  );
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(["basic"]),
  );
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const form = useForm<z.infer<typeof programCreateSchema>>({
    resolver: zodResolver(programCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDesc: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      status: "draft",
      format: "online",
      level: "beginner",
      order: 0,
      tags: [],
      priceTiers: [],
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { formState } = form;

  const sectionErrors: Record<SectionId, boolean> = {
    basic: !!(
      formState.errors.title ||
      formState.errors.description ||
      formState.errors.shortDesc ||
      formState.errors.categoryId ||
      formState.errors.badge ||
      formState.errors.highlight
    ),
    details: !!(
      formState.errors.format ||
      formState.errors.level ||
      formState.errors.duration ||
      formState.errors.order
    ),
    pricing: !!(
      formState.errors.basePrice ||
      formState.errors.originalPrice ||
      formState.errors.priceTiers
    ),
    media: !!(
      formState.errors.thumbnail ||
      formState.errors.icon ||
      formState.errors.tags
    ),
  };

  const totalErrors = Object.values(sectionErrors).filter(Boolean).length;
  const showBanner =
    formState.submitCount > 0 && totalErrors > 0 && !bannerDismissed;

  useEffect(() => {
    if (formState.submitCount > 0) setBannerDismissed(false);
  }, [formState.submitCount]);

  /* Scroll-spy */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      let current: SectionId = "basic";
      for (const id of [
        "basic",
        "details",
        "pricing",
        "media",
      ] as SectionId[]) {
        const el = document.getElementById(`section-${id}`);
        if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY)
          current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = useCallback((id: SectionId) => {
    setActiveSection(id);
    // Auto-expand when navigating
    setExpandedSections((prev) => new Set([...prev, id]));
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const toggleSection = useCallback((id: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    console.log(values);
    setIsSubmitting(false);
    setIsSuccess(true);
  }

  function onError() {
    const order: SectionId[] = ["basic", "details", "pricing", "media"];
    for (const id of order) {
      if (sectionErrors[id]) {
        setExpandedSections((prev) => new Set([...prev, id]));
        handleNavigate(id);
        break;
      }
    }
  }

  /* Success screen */
  if (isSuccess) {
    return (
      <>
        <SiteHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Programs", href: "/dashboard/programs" },
            { label: "Create" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="text-center max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative mx-auto mb-6 flex size-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              <div className="relative flex size-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                <Check className="size-7 text-emerald-600" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2 text-neutral-800">
              Program Created
            </h2>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
              Your program has been saved. Head to the dashboard to publish,
              preview, or make edits.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild className="gap-2 rounded-lg">
                <Link href="/dashboard/programs">
                  <ArrowLeft className="size-4" />
                  View Programs
                </Link>
              </Button>
              <Button
                className="gap-2 rounded-lg"
                onClick={() => {
                  setIsSuccess(false);
                  setCompletedSections(new Set());
                  setExpandedSections(new Set(["basic"]));
                  form.reset();
                  window.scrollTo({ top: 0 });
                }}
              >
                <Plus className="size-4" />
                Create Another
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const previewItems = [
    { label: "Title", value: form.watch("title") || null },
    {
      label: "Category",
      value:
        categories.find((c) => c.id === form.watch("categoryId"))?.label ||
        null,
    },
    { label: "Format", value: form.watch("format") || null },
    { label: "Level", value: form.watch("level") || null },
    {
      label: "Duration",
      value: form.watch("duration") ? `${form.watch("duration")} hrs` : null,
    },
    { label: "Status", value: form.watch("status") || null },
  ];

  return (
    <>
      <SiteHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Programs", href: "/dashboard/programs" },
          { label: "Create" },
        ]}
      />

      <div className="flex flex-1 flex-col">
        <div className=" w-full max-w-6xl px-8 py-6 lg:py-8">
          {/* Page header */}
          <div className="mb-8 flex items-start gap-4">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="size-9 shrink-0 rounded-lg mt-0.5"
            >
              <Link href="/dashboard/programs">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-neutral-800">
                Create Program
              </h1>
              <p className="text-sm text-neutral-400 mt-0.5">
                Fill out all sections, then submit when ready.
              </p>
            </div>
            {/* Mobile submit button in header */}
            <button
              type="submit"
              form="program-create-form"
              disabled={isSubmitting}
              className={cn(
                "lg:hidden flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Create
                </>
              )}
            </button>
          </div>

          {/* Dismissible error banner */}
          {showBanner && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Please fix errors in {totalErrors} section
                  {totalErrors > 1 ? "s" : ""} before submitting.
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {(Object.entries(sectionErrors) as [SectionId, boolean][])
                    .filter(([, hasErr]) => hasErr)
                    .map(([id]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleNavigate(id)}
                        className="text-xs text-red-600 underline underline-offset-2 hover:text-red-800 font-medium"
                      >
                        {SECTIONS.find((s) => s.id === id)?.label}
                      </button>
                    ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="shrink-0 flex size-7 items-center justify-center rounded-lg text-red-400 hover:bg-red-100 hover:text-red-600 transition-all"
                aria-label="Dismiss error banner"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr] gap-4 items-start">
            {/* ── Sticky sidebar ── */}
            <aside className="hidden lg:flex flex-col gap-3 sticky top-6">
              <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Sections
                </p>
                <SideNav
                  activeSection={activeSection}
                  sectionErrors={sectionErrors}
                  completedSections={completedSections}
                  expandedSections={expandedSections}
                  onNavigate={handleNavigate}
                />
              </div>

              {/* Progress bar */}
              <ProgressBar form={form} />

              {/* Live preview */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Preview
                </p>
                <div className="flex flex-col gap-2.5">
                  {previewItems.map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        {label}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium truncate",
                          value
                            ? "text-neutral-700"
                            : "text-neutral-300 italic",
                        )}
                      >
                        {value ?? "Not set"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit in sidebar */}
              <button
                type="submit"
                form="program-create-form"
                disabled={isSubmitting}
                className={cn(
                  "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150",
                  "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Create Program
                  </>
                )}
              </button>
            </aside>

            {/* ── Main form ── */}
            <form
              id="program-create-form"
              onSubmit={form.handleSubmit(onSubmit, onError)}
              noValidate
            >
              <div className="flex flex-col gap-4">
                {SECTIONS.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isExpanded={expandedSections.has(section.id)}
                    hasError={sectionErrors[section.id]}
                    isComplete={
                      completedSections.has(section.id) &&
                      !sectionErrors[section.id]
                    }
                    onToggle={() => toggleSection(section.id)}
                    form={form}
                    categories={categories}
                  >
                    {section.id === "basic" && (
                      <BasicSection
                        form={form}
                        color={section.color}
                        categories={categories}
                        isLoadingCategories={isLoadingCategories}
                      />
                    )}
                    {section.id === "details" && (
                      <DetailsSection form={form} color={section.color} />
                    )}
                    {section.id === "pricing" && (
                      <PricingSection form={form} color={section.color} />
                    )}
                    {section.id === "media" && (
                      <MediaSection form={form} color={section.color} />
                    )}
                  </SectionCard>
                ))}

                {/* Mobile submit */}
                <div className="lg:hidden pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-150",
                      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check className="size-4" />
                        Create Program
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-neutral-400 pb-4">
                  Fields marked{" "}
                  <span className="text-red-500 font-semibold">*</span> are
                  required
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgramCreatePage;
