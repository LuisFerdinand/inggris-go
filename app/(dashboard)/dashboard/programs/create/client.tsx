"use client";

import { SiteHeader } from "@/components/sidebar/site-header";
import { Button } from "@/components/ui/button";
import {
  makeResolver,
  ProgramCreateData,
  programCreateSchema,
} from "@/lib/zodSchemas";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  Tag,
  TrendingUp,
  X,
  CheckCircle2,
  CalendarClock,
  Repeat,
  Edit,
  PlusCircle,
  Rocket,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useCallback, useEffect } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import {
  FormField,
  StyledInput,
  SelectInput,
  StyledTextarea,
} from "@/components/Form";
import {
  PROGRAM_FORMAT_OPTIONS,
  PROGRAM_LEVEL_OPTIONS,
  PROGRAM_STATUS_OPTIONS,
} from "@/lib/enums";
import DurationInput from "@/components/Form/DurationInput";
import { PageHeader } from "@/components/PageHeader";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { IconPicker } from "@/components/IconPicker";

type FormValues = ProgramCreateData;
type SectionId = "basic" | "details" | "media";
type Category = { id: string; label: string; icon?: string | null };

// ─── Section color tokens ─────────────────────────────────────────────────────

type SectionColor = {
  accent: string;
  bg: string;
  border: string;
  iconBg: string;
  iconText: string;
  badgeBg: string;
  badgeText: string;
  dividerBg: string;
  dividerBorder: string;
  checkBg: string;
  checkText: string;
  dot: string;
};

// ─── Section definitions ──────────────────────────────────────────────────────

type SectionConfig = {
  id: SectionId;
  label: string;
  labelId: string;
  icon: React.ReactNode;
  description: string;
  color: SectionColor;
};

const SECTIONS: SectionConfig[] = [
  {
    id: "basic",
    label: "Informasi Dasar",
    labelId: "01",
    icon: <FileText className="size-4" />,
    description: "Judul, deskripsi & kategori",
    color: {
      accent: "#2563eb",
      bg: "bg-blue-50/60",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      badgeBg: "bg-blue-50 border border-blue-100",
      badgeText: "text-blue-700",
      dividerBg: "bg-blue-50/80",
      dividerBorder: "border-blue-100",
      checkBg: "bg-blue-50",
      checkText: "text-blue-600",
      dot: "bg-blue-500",
    },
  },
  {
    id: "details",
    label: "Detail Program",
    labelId: "02",
    icon: <Layers className="size-4" />,
    description: "Format, level, jadwal & durasi",
    color: {
      accent: "#0d9488",
      bg: "bg-teal-50/60",
      border: "border-teal-100",
      iconBg: "bg-teal-100",
      iconText: "text-teal-600",
      badgeBg: "bg-teal-50 border border-teal-100",
      badgeText: "text-teal-700",
      dividerBg: "bg-teal-50/80",
      dividerBorder: "border-teal-100",
      checkBg: "bg-teal-50",
      checkText: "text-teal-600",
      dot: "bg-teal-500",
    },
  },
  {
    id: "media",
    label: "Media & Tag",
    labelId: "03",
    icon: <ImageIcon className="size-4" />,
    description: "Thumbnail, ikon & tag",
    color: {
      accent: "#7c3aed",
      bg: "bg-purple-50/60",
      border: "border-purple-100",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
      badgeBg: "bg-purple-50 border border-purple-100",
      badgeText: "text-purple-700",
      dividerBg: "bg-purple-50/80",
      dividerBorder: "border-purple-100",
      checkBg: "bg-purple-50",
      checkText: "text-purple-600",
      dot: "bg-purple-500",
    },
  },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

const baseInput =
  "h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all outline-none " +
  "placeholder:text-neutral-400 border-neutral-200 hover:border-neutral-300 " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

const errorInputCls =
  "border-red-400 focus:border-red-500 focus:ring-red-500/10";

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
      className={cn(baseInput, invalid && errorInputCls, className)}
    />
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────

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
          className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
        >
          <Tag className="size-2.5 shrink-0" />
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
            aria-label={`Hapus tag ${tag}`}
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
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={
          value.length === 0 ? "Ketik tag, tekan Enter atau koma" : ""
        }
        className="flex-1 min-w-28 bg-transparent outline-none placeholder:text-neutral-400 text-sm"
      />
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────

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
  color: SectionColor;
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

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

function SideNav({
  activeSection,
  sectionErrors,
  completedSections,
  onNavigate,
}: {
  activeSection: SectionId;
  sectionErrors: Record<SectionId, boolean>;
  completedSections: Set<SectionId>;
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {SECTIONS.map((s) => {
        const isActive = activeSection === s.id;
        const hasError = sectionErrors[s.id];
        const isDone = completedSections.has(s.id) && !hasError;
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
                "flex size-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-all",
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
            {isActive && (
              <div
                className={cn("size-1.5 rounded-full shrink-0", s.color.dot)}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ form }: { form: UseFormReturn<FormValues> }) {
  const title = form.watch("title") || "";
  const description = form.watch("description") || "";
  const categoryId = form.watch("categoryId") || "";
  const format = form.watch("format") || "";
  const level = form.watch("level") || "";
  const status = form.watch("status") || "";
  const duration = form.watch("duration");
  const scheduleType = form.watch("scheduleType") || "";

  const fields = [
    title,
    description,
    categoryId,
    format,
    level,
    status,
    duration,
    scheduleType,
  ];
  const filled = fields.filter(
    (v) => v !== undefined && v !== null && v !== "",
  ).length;
  const pct = Math.round((filled / fields.length) * 100);

  const barColor =
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
          Kelengkapan
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
            barColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && (
        <p className="mt-2 text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 className="size-3" /> Semua field wajib terisi
        </p>
      )}
    </div>
  );
}

// ─── Section snippet (collapsed preview) ─────────────────────────────────────

function SectionSnippet({
  id,
  form,
  color,
  categories,
}: {
  id: SectionId;
  form: UseFormReturn<FormValues>;
  color: SectionColor;
  categories: Category[];
}) {
  const snippets: Record<
    SectionId,
    { label: string; value: string | undefined }[]
  > = {
    basic: [
      { label: "Judul", value: form.watch("title") || undefined },
      {
        label: "Kategori",
        value: categories.find((c) => c.id === form.watch("categoryId"))?.label,
      },
      { label: "Status", value: form.watch("status") || undefined },
    ],
    details: [
      {
        label: "Format",
        value: PROGRAM_FORMAT_OPTIONS.find((f) => f.id === form.watch("format"))
          ?.label,
      },
      {
        label: "Level",
        value: PROGRAM_LEVEL_OPTIONS.find((l) => l.id === form.watch("level"))
          ?.label,
      },
      {
        label: "Jadwal",
        value:
          form.watch("scheduleType") === "scheduled"
            ? "Terjadwal (batch)"
            : form.watch("scheduleType") === "permanent"
              ? "Permanen (paket langsung)"
              : undefined,
      },
      {
        label: "Durasi",
        value: form.watch("duration")
          ? `${form.watch("duration")} hari`
          : undefined,
      },
    ],
    media: [
      {
        label: "Thumbnail",
        value: form.watch("thumbnail") ? "Sudah diatur" : undefined,
      },
      {
        label: "Tag",
        value:
          (form.watch("tags")?.length ?? 0) > 0
            ? `${form.watch("tags")?.length} tag`
            : undefined,
      },
    ],
  };

  const items = snippets[id].filter((i) => i.value);
  if (items.length === 0) {
    return (
      <p className="text-xs text-neutral-400 italic px-6 pb-4">
        Belum ada data — klik untuk mulai mengisi.
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

// ─── Collapsible section card ─────────────────────────────────────────────────

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
  const borderLeftColor = hasError
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
      style={{ borderLeftColor, borderLeftWidth: 3 }}
    >
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                color.iconText,
              )}
            >
              {section.labelId}
            </span>
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
                Perlu diperbaiki
              </span>
            )}
            {isComplete && !hasError && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-600 rounded px-1.5 py-0.5">
                Lengkap
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {section.description}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "size-4 text-neutral-400 shrink-0 transition-transform duration-200 group-hover:text-neutral-600",
            isExpanded && "rotate-180",
          )}
        />
      </button>

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

      {isExpanded && (
        <div className="px-6 py-4 sm:px-8 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Section: Informasi Dasar ─────────────────────────────────────────────────

function BasicSection({
  form,
  color,
  categories,
  isLoadingCategories,
}: {
  form: UseFormReturn<FormValues>;
  color: SectionColor;
  categories: Category[];
  isLoadingCategories: boolean;
}) {
  const {
    register,
    formState: { errors },
    control,
  } = form;

  return (
    <div className="flex flex-col gap-5">
      <SectionDivider
        id="basic"
        icon={<FileText className="size-4" />}
        title="Informasi Dasar"
        description="Nama, deskripsi, dan kategori program"
        color={color}
      />

      {/* Title */}
      <FormField label="Judul Program" required error={errors.title?.message}>
        <StyledInput
          {...register("title")}
          placeholder="Contoh: Daily Conversation Intensif"
          error={!!errors.title}
          maxLength={100}
        />
      </FormField>

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField
            label="Deskripsi Lengkap"
            required
            error={errors.description?.message}
          >
            <RichTextEditor field={field}></RichTextEditor>
          </FormField>
        )}
      ></Controller>

      {/* Short description */}
      <FormField label="Deskripsi Singkat" error={errors.shortDesc?.message}>
        <StyledTextarea
          {...register("shortDesc")}
          rows={2}
          maxLength={200}
          placeholder="Satu kalimat menarik yang membuat orang ingin mendaftar…"
        />
        <p className="text-xs text-neutral-400 mt-0.5">
          Maksimal 200 karakter. Ditampilkan di kartu program.
        </p>
      </FormField>

      {/* Category */}
      <Controller
        name="categoryId"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField
            label="Kategori Program"
            required
            error={fieldState.error?.message}
          >
            <SelectInput
              options={categories.map((cat) => ({
                id: cat.id,
                label: cat.label,
                icon: cat.icon ?? undefined,
              }))}
              variant="dropdown"
              value={field.value}
              onChange={(id) => field.onChange(id)}
              placeholder="Pilih kategori program"
              error={!!fieldState.error}
              loading={isLoadingCategories}
            />
          </FormField>
        )}
      />

      {/* Status */}
      <Controller
        name="status"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField
            label="Status Program"
            required
            error={fieldState.error?.message}
          >
            <SelectInput
              options={PROGRAM_STATUS_OPTIONS}
              value={field.value}
              cardColumns={3}
              variant="cards"
              onChange={(id) => field.onChange(id)}
              placeholder="Pilih status"
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />

      {/* Badge & Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Badge" error={errors.badge?.message}>
          <StyledInput
            {...register("badge")}
            icon={
              <Award className="pointer-events-none size-3.5 text-neutral-400" />
            }
            placeholder="Terlaris / Baru / Hot"
            maxLength={50}
            error={!!errors.badge}
          />
        </FormField>
        <FormField label="Highlight" error={errors.highlight?.message}>
          <StyledInput
            {...register("highlight")}
            icon={
              <TrendingUp className="pointer-events-none size-3.5 text-neutral-400" />
            }
            placeholder="Sertifikat disertakan"
            maxLength={160}
            error={!!errors.highlight}
          />
        </FormField>
      </div>
    </div>
  );
}

// ─── Section: Detail Program ──────────────────────────────────────────────────

// Schedule type card option
const SCHEDULE_TYPE_OPTIONS = [
  {
    id: "permanent",
    label: "Permanen",
    description:
      "Paket langsung tanpa batch. Cocok untuk kelas rolling, private, atau program mandiri.",
    icon: <Repeat className="size-4" />,
  },
  {
    id: "scheduled",
    label: "Terjadwal",
    description:
      "Program memiliki batch dengan jadwal tetap. Cocok untuk kelas kohort atau camp.",
    icon: <CalendarClock className="size-4" />,
  },
];

function ScheduleTypeCards({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-3",
        error && "ring-1 ring-red-400 rounded-xl p-1",
      )}
    >
      {SCHEDULE_TYPE_OPTIONS.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all duration-150",
              isSelected
                ? "border-blue-500 bg-blue-50/60 shadow-sm shadow-blue-100"
                : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/60",
            )}
          >
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                isSelected
                  ? "bg-blue-100 text-blue-600"
                  : "bg-neutral-100 text-neutral-500",
              )}
            >
              {opt.icon}
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-blue-700" : "text-neutral-700",
                )}
              >
                {opt.label}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                {opt.description}
              </p>
            </div>
            {isSelected && (
              <div className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-blue-500">
                <Check className="size-3 text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DetailsSection({
  form,
  color,
}: {
  form: UseFormReturn<FormValues>;
  color: SectionColor;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionDivider
        id="details"
        icon={<Layers className="size-4" />}
        title="Detail Program"
        description="Format, tipe jadwal, level, dan estimasi durasi"
        color={color}
      />

      {/* Format */}
      <Controller
        name="format"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField
            label="Format Program"
            required
            error={fieldState.error?.message}
          >
            <SelectInput
              options={PROGRAM_FORMAT_OPTIONS}
              value={field.value}
              cardColumns={3}
              variant="cards"
              onChange={(id) => field.onChange(id)}
              placeholder="Pilih format"
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />

      {/* Schedule type — this drives the entire edit-page structure */}
      <Controller
        name="scheduleType"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField
            label="Tipe Jadwal"
            required
            error={fieldState.error?.message}
            hint="Menentukan apakah program menggunakan batch atau paket langsung. Dapat diubah di halaman edit."
          >
            <ScheduleTypeCards
              value={field.value ?? "permanent"}
              onChange={field.onChange}
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />

      {/* Level */}
      <Controller
        name="level"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField
            label="Level Program"
            required
            error={fieldState.error?.message}
          >
            <SelectInput
              options={PROGRAM_LEVEL_OPTIONS}
              value={field.value}
              cardColumns={3}
              variant="cards"
              onChange={(id) => field.onChange(id)}
              placeholder="Pilih level"
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />

      {/* Duration */}
      <Controller
        name="duration"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField label="Estimasi Durasi" error={fieldState.error?.message}>
            <DurationInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />
    </div>
  );
}

// ─── Section: Media & Tag ─────────────────────────────────────────────────────

function MediaSection({
  form,
  color,
}: {
  form: UseFormReturn<FormValues>;
  color: SectionColor;
}) {
  const { control } = form;
  const thumbnail = (form.watch("thumbnail") ?? "") as string;
  const tags = form.watch("tags") ?? [];

  return (
    <div className="flex flex-col gap-5">
      <SectionDivider
        id="media"
        icon={<ImageIcon className="size-4" />}
        title="Media & Tag"
        description="Visual dan tag yang membantu program ditemukan"
        color={color}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Thumbnail */}
        <Controller
          name="thumbnail"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              label="URL Thumbnail"
              hint="Disarankan rasio 16:9 (1280×720)"
              error={fieldState.error?.message}
            >
              <Input
                {...field}
                value={field.value ?? ""}
                type="url"
                placeholder="https://…/thumbnail.jpg"
                invalid={fieldState.invalid}
              />
              {thumbnail && !fieldState.invalid && (
                <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200 aspect-video bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail}
                    alt="Preview thumbnail"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </FormField>
          )}
        />

        <Controller
          name="icon"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              label="Nama Ikon"
              hint="Pilih ikon dari library Lucide"
              error={fieldState.error?.message}
            >
              <IconPicker
                value={field.value ?? undefined}
                onChange={(name) => field.onChange(name ?? "")}
                placeholder="Pilih ikon…"
              />
            </FormField>
          )}
        />
      </div>

      {/* Tags */}
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <FormField
            label="Tag Program"
            hint="Tekan Enter atau koma untuk menambah tag. Membantu peserta menemukan program."
          >
            <TagInput value={field.value ?? []} onChange={field.onChange} />
            {(tags.length ?? 0) > 0 && (
              <p className="text-xs text-neutral-400">
                {tags.length} tag ditambahkan
              </p>
            )}
          </FormField>
        )}
      />
    </div>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({
  isSubmitting,
  className,
}: {
  isSubmitting: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      form="program-create-form"
      disabled={isSubmitting}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150",
        "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm shadow-blue-600/30",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Menyimpan…
        </>
      ) : (
        <>
          <PlusCircle className="size-4" />
          Buat Program
        </>
      )}
    </button>
  );
}

// ─── Info banner (no pricing on create) ──────────────────────────────────────

function EditReminder() {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3.5 flex items-start gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 mt-0.5">
        <Clock className="size-3.5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-800">
          Harga & Paket diatur di halaman Edit
        </p>
        <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
          Setelah program dibuat, buka halaman{" "}
          <span className="font-semibold">Edit Program</span> untuk menambahkan
          paket harga (program permanen) atau batch beserta paketnya (program
          terjadwal).
        </p>
      </div>
    </div>
  );
}

// ─── Live preview sidebar card ────────────────────────────────────────────────

function PreviewCard({
  form,
  categories,
}: {
  form: UseFormReturn<FormValues>;
  categories: Category[];
}) {
  const scheduleType = form.watch("scheduleType");
  const items = [
    { label: "Judul", value: form.watch("title") || null },
    {
      label: "Kategori",
      value:
        categories.find((c) => c.id === form.watch("categoryId"))?.label ||
        null,
    },
    { label: "Format", value: form.watch("format") || null },
    { label: "Level", value: form.watch("level") || null },
    {
      label: "Durasi",
      value: form.watch("duration") ? `${form.watch("duration")} hari` : null,
    },
    { label: "Status", value: form.watch("status") || null },
    {
      label: "Jadwal",
      value:
        scheduleType === "scheduled"
          ? "Terjadwal"
          : scheduleType === "permanent"
            ? "Permanen"
            : null,
    },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        Pratinjau
      </p>
      <div className="flex flex-col gap-2.5">
        {items.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {label}
            </span>
            <span
              className={cn(
                "text-xs font-medium truncate",
                value ? "text-neutral-700" : "text-neutral-300 italic",
              )}
            >
              {value ?? "Belum diisi"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const CreateProgramPageClient = () => {
  const { data: categories = [], isLoading: isLoadingCategories } =
    trpc.programs.getCategories.useQuery();
  const createProgram = trpc.programs.createProgram.useMutation();

  const [activeSection, setActiveSection] = useState<SectionId>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [completedSections, setCompletedSections] = useState<Set<SectionId>>(
    new Set(),
  );
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(["basic"]),
  );
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const form = useForm<ProgramCreateData>({
    resolver: makeResolver(programCreateSchema) as any,
    defaultValues: {
      categoryId: "",
      status: "draft",
      format: "online",
      level: "beginner",
      scheduleType: "permanent",
      registrationType: "online",
      tags: [],
    },
  });

  const { handleSubmit, formState } = form;

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
      formState.errors.scheduleType ||
      formState.errors.level ||
      formState.errors.duration
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

  // Scroll-spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      let current: SectionId = "basic";
      for (const id of ["basic", "details", "media"] as SectionId[]) {
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
    setExpandedSections((prev) => new Set([...prev, id]));
    const el = document.getElementById(`section-${id}`);
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 96,
        behavior: "smooth",
      });
  }, []);

  const toggleSection = useCallback((id: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  async function onSubmit(values: ProgramCreateData) {
    setIsSubmitting(true);
    try {
      const result = await createProgram.mutateAsync(values);
      setCreatedSlug(result.slug);
      setCreatedId(result.id);
      setIsSuccess(true);
    } catch (err) {
      console.error("Gagal membuat program:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function onError() {
    const order: SectionId[] = ["basic", "details", "media"];
    for (const id of order) {
      if (sectionErrors[id]) {
        setExpandedSections((prev) => new Set([...prev, id]));
        handleNavigate(id);
        break;
      }
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <>
        {" "}
        <PageHeader
          titleBadge={{
            label: "Langkah pertama",
            icon: <Rocket className="size-3" />,
          }}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Programs", href: "/dashboard/programs" },
            { label: "Buat", icon: <Pencil /> },
          ]}
          title="Buat Program Baru"
          description="View and manage all learning programs."
          backButton={{ href: "/dashboard/programs" }}
        />
        <div className="flex flex-1 items-center justify-center py-20 px-6">
          <div className="text-center max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative mx-auto mb-6 flex size-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              <div className="relative flex size-20 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-200">
                <Check className="size-8 text-emerald-600" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-neutral-800">
              Program Berhasil Dibuat! 🎉
            </h2>
            <p className="text-sm text-neutral-500 mb-2 leading-relaxed">
              Program telah tersimpan sebagai draft. Lanjutkan ke halaman edit
              untuk menambahkan
              {form.getValues("scheduleType") === "scheduled"
                ? " batch dan paket harga."
                : " paket harga."}
            </p>
            {createdSlug && (
              <p className="text-xs text-neutral-400 mb-8 font-mono bg-neutral-100 rounded-lg px-3 py-1.5 inline-block">
                slug: {createdSlug}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild className="gap-2 rounded-xl">
                <Link href="/dashboard/programs">
                  <ArrowLeft className="size-4" />
                  Semua Program
                </Link>
              </Button>
              <Button className="gap-2 rounded-xl" asChild>
                <Link href={`/dashboard/programs/${createdId}/edit`}>
                  <Edit className="size-4" />
                  Lanjut Edit
                </Link>
              </Button>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setCreatedSlug("");
                setCreatedId("");
                setCompletedSections(new Set());
                setExpandedSections(new Set(["basic"]));
                form.reset();
                window.scrollTo({ top: 0 });
              }}
              className="mt-4 text-xs text-neutral-400 hover:text-neutral-600 underline underline-offset-2"
            >
              Buat program lain
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        titleBadge={{
          label: "Langkah pertama",
          icon: <Rocket className="size-3" />,
        }}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Programs", href: "/dashboard/programs" },
          { label: "Buat", icon: <Pencil /> },
        ]}
        title="Buat Program Baru"
        description="View and manage all learning programs."
        backButton={{ href: "/dashboard/programs" }}
      />
      <div className="flex flex-1 flex-col">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Error banner */}
          {showBanner && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Ada kesalahan di {totalErrors} bagian. Perbaiki sebelum
                  menyimpan.
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {(Object.entries(sectionErrors) as [SectionId, boolean][])
                    .filter(([, e]) => e)
                    .map(([id]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleNavigate(id as SectionId)}
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
                aria-label="Tutup"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
            {/* Main form */}
            <form
              id="program-create-form"
              onSubmit={handleSubmit(onSubmit, onError)}
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
                    {section.id === "media" && (
                      <MediaSection form={form} color={section.color} />
                    )}
                  </SectionCard>
                ))}

                {/* Reminder banner above submit on mobile */}
                <div className="lg:hidden">
                  <EditReminder />
                </div>

                {/* Mobile submit */}
                <div className="lg:hidden pt-2">
                  <SubmitButton
                    isSubmitting={isSubmitting}
                    className="w-full"
                  />
                </div>

                <p className="text-center text-xs text-neutral-400 pb-4">
                  Kolom bertanda{" "}
                  <span className="text-red-500 font-semibold">*</span> wajib
                  diisi
                </p>
              </div>
            </form>

            {/* Sticky sidebar */}
            <aside className="hidden lg:flex flex-col gap-3 sticky top-20">
              {/* Nav */}
              <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Navigasi Bagian
                </p>
                <SideNav
                  activeSection={activeSection}
                  sectionErrors={sectionErrors}
                  completedSections={completedSections}
                  onNavigate={handleNavigate}
                />
              </div>

              {/* Progress */}
              <ProgressBar form={form} />

              {/* Live preview */}
              <PreviewCard form={form} categories={categories} />

              {/* Reminder */}
              <EditReminder />

              {/* Submit */}
              <SubmitButton isSubmitting={isSubmitting} className="w-full" />

              {/* tRPC error */}
              {createProgram.isError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 animate-in fade-in duration-200">
                  <p className="font-semibold mb-0.5">Terjadi kesalahan</p>
                  <p className="text-red-500">{createProgram.error.message}</p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProgramPageClient;
