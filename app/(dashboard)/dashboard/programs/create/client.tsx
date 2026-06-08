// app/(dashboard)/dashboard/programs/create/client.tsx
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
  Tags,
  Eye,
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
  Category,
} from "@/components/Form";
import {
  PROGRAM_FORMAT_OPTIONS,
  PROGRAM_LEVEL_OPTIONS,
  PROGRAM_STATUS_META,
  PROGRAM_STATUS_OPTIONS,
} from "@/lib/enums/enums";
import DurationInput from "@/components/Form/DurationInput";
import { PageHeader } from "@/components/PageHeader";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { IconPicker } from "@/components/IconPicker";
import { Icon } from "@/components/Icon";
import { useImageUpload } from "@/components/file-uploader/useImageUpload";
import toast from "react-hot-toast";
import { uploadFiles } from "@/lib/uploadthing/client";
import { ImageUploadField } from "@/components/file-uploader/ImageUploadField";
import { getToneStyle } from "@/lib/ui/ui.helpers";
import { ContentCreateSection } from "./ContentCreateSection";

type FormValues = ProgramCreateData;
type SectionId = "basic" | "details" | "media";

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

export function TagInput({
  value = [],
  onChange,
  placeholder,
}: {
  value?: string[];
  placeholder?: string;
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
          value.length === 0
            ? placeholder
              ? placeholder
              : "Ketik tag, tekan Enter atau koma"
            : ""
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

type SectionSnippetProps = {
  id: SectionId;
  form: UseFormReturn<FormValues>;
  color: SectionColor;
  categories: Category[];
  imagePreviewUrl?: string | null;
};

function SectionSnippet({
  id,
  form,
  color,
  categories,
  imagePreviewUrl,
}: SectionSnippetProps) {
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
        value: imagePreviewUrl ? "Sudah diupload" : undefined,
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
  imageUpload,
}: {
  section: SectionConfig;
  isExpanded: boolean;
  hasError: boolean;
  isComplete: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  form: UseFormReturn<FormValues>;
  categories: Category[];
  imageUpload: ReturnType<typeof useImageUpload>;
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
            imagePreviewUrl={imageUpload.previewUrl}
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

      {/* <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <FormField
            label="Deskripsi Lengkap"
            required
            error={errors.description?.message}
          >
            <RichTextEditor field={field}></RichTextEditor>
          </FormField>
        )}
      ></Controller> */}
      <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <FormField
            label="Deskripsi Lengkap"
            required
            error={errors.description?.message}
          >
            <StyledTextarea
              {...register("description")}
              rows={4}
              maxLength={200}
              placeholder="Satu kalimat menarik yang membuat orang ingin mendaftar…"
            />{" "}
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
  imageUpload,
  isSubmitting,
}: {
  form: UseFormReturn<FormValues>;
  color: SectionColor;
  imageUpload: ReturnType<typeof useImageUpload>;
  isSubmitting: boolean;
}) {
  const { control } = form;
  const tags = form.watch("tags") ?? [];

  return (
    <div className="flex flex-col gap-6">
      <SectionDivider
        id="media"
        icon={<ImageIcon className="size-4" />}
        title="Media & Tags"
        description="Visuals and tags that help your program get discovered"
        color={color}
      />

      {/* ── Primary: Thumbnail upload ── */}
      <ImageUploadField
        value={imageUpload.previewUrl}
        onChange={imageUpload.handleFileSelect}
        onRemove={imageUpload.removeFile}
        disabled={isSubmitting}
        label="Program Thumbnail"
        hint="Recommended 1280 × 720px for best quality"
        description="PNG, JPG, WEBP"
        maxSizeLabel="Max 4MB"
        aspectRatioPresets={["16/9", "4/3", "1/1"]}
        error={imageUpload.error}
      />

      {/* ── Supporting metadata ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Icon picker */}
        <Controller
          name="icon"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              label="Program Icon"
              hint="Choose an icon from Lucide"
              error={fieldState.error?.message}
            >
              <IconPicker
                value={field.value ?? undefined}
                onChange={(name) => field.onChange(name ?? "")}
                placeholder="Select icon..."
              />
            </FormField>
          )}
        />

        {/* Tags */}
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <FormField label="Tags" hint="Press Enter or comma to add tags">
              <TagInput value={field.value ?? []} onChange={field.onChange} />

              {tags.length > 0 && (
                <p className="text-xs text-neutral-400">
                  {tags.length} tags added
                </p>
              )}
            </FormField>
          )}
        />
      </div>
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

export function getOptionLabel(
  options: { id: string; label: string }[],
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return options.find((o) => o.id === value)?.label ?? null;
}

export function getOptionMeta<T extends { id: string; label: string }>(
  options: T[],
  value: string | null | undefined,
): T | null {
  if (!value) return null;
  return options.find((o) => o.id === value) ?? null;
}

const SCHEDULE_META: Record<
  string,
  { label: string; icon: string; iconNode: React.ReactNode }
> = {
  permanent: {
    label: "Permanen",
    icon: "repeat",
    iconNode: <Repeat className="size-2.5" />,
  },
  scheduled: {
    label: "Terjadwal",
    icon: "calendar-clock",
    iconNode: <CalendarClock className="size-2.5" />,
  },
};

function PreviewBadge({
  children,
  style,
}: {
  children: React.ReactNode;
  // inline hex color from option.color
  style?: { bg: string; text: string };
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5",
        "text-[9px] font-semibold uppercase tracking-wide",
        style?.bg ?? "bg-neutral-100",
        style?.text ?? "text-neutral-600",
        "border-current border-opacity-20",
      )}
    >
      {children}
    </span>
  );
}

function OptionBadge({
  option,
  size = "sm",
}: {
  option: { label: string; icon?: string; color?: string } | null;
  size?: "sm" | "xs";
}) {
  if (!option) return null;
  const iconSize = size === "xs" ? "size-2" : "size-2.5";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
      style={
        option.color
          ? {
              backgroundColor: option.color + "18", // ~10% alpha
              color: option.color,
              borderColor: option.color + "33",
            }
          : undefined
      }
    >
      <Icon name={option.icon} className={iconSize} />
      {option.label}
    </span>
  );
}

function SkeletonLine({ w = "w-24" }: { w?: string }) {
  return (
    <div className={cn("h-2 rounded-full bg-neutral-100 animate-pulse", w)} />
  );
}

function ThumbnailArea({ src }: { src: string | null | undefined }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Thumbnail"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200">
        <ImageIcon className="size-4 text-neutral-300" />
      </div>
      <p className="text-[9px] text-neutral-400 font-medium tracking-wide">
        Tambah thumbnail
      </p>
    </div>
  );
}

type PreviewCardProps = {
  form: UseFormReturn<FormValues>;
  categories: Category[];
  thumbnailUrl?: string | null;
};

export function PreviewCard({
  form,
  categories,
  thumbnailUrl,
}: PreviewCardProps) {
  const title = form.watch("title");
  const shortDesc = form.watch("shortDesc");
  const categoryId = form.watch("categoryId");
  const format = form.watch("format");
  const level = form.watch("level");
  const status = form.watch("status");
  const duration = form.watch("duration");
  const scheduleType = form.watch("scheduleType");
  const tags = form.watch("tags") ?? [];
  const badge = form.watch("badge");
  const highlight = form.watch("highlight");

  // Resolve rich option objects — icons and colors come from the arrays directly
  const formatOption = getOptionMeta(PROGRAM_FORMAT_OPTIONS, format);
  const levelOption = getOptionMeta(PROGRAM_LEVEL_OPTIONS, level);
  const statusOption = getOptionMeta(PROGRAM_STATUS_OPTIONS, status);
  const categoryLabel =
    categories.find((c) => c.id === categoryId)?.label ?? null;
  const schedMeta = scheduleType ? SCHEDULE_META[scheduleType] : null;
  const programStatus = status ? PROGRAM_STATUS_META[status] : null;
  const statusStyle = getToneStyle(programStatus?.tone);
  const isEmpty = !title && !shortDesc && !categoryId && !format && !level;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-100 bg-neutral-50/60">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Pratinjau Program
        </p>
        {!isEmpty && (
          <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5 inline-flex items-center gap-1">
            <span className="size-1 rounded-full bg-emerald-500 inline-block" />
            Live
          </span>
        )}
      </div>

      {/* ── Thumbnail ── */}
      <div className="relative bg-neutral-50 border-b border-neutral-100 aspect-[16/9] overflow-hidden">
        <ThumbnailArea src={thumbnailUrl} />

        {/* Status badge overlay — bottom-left */}
        {statusOption && statusStyle && (
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                "text-[9px] font-bold uppercase tracking-wide border",
                statusStyle.bg,
                statusStyle.text,
                "border-current border-opacity-20",
              )}
            >
              <span className={cn("size-1.5 rounded-full", statusStyle.dot)} />
              <Icon name={statusOption.icon} className="size-2.5" />
              {statusOption.label}
            </span>
          </div>
        )}

        {/* Badge pill — top-right */}
        {badge && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-950 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
              <Award className="size-2.5" />
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-3 p-3.5">
        {/* Category + format + level row */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {categoryLabel ? (
            <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-full px-2 py-0.5">
              {categoryLabel}
            </span>
          ) : (
            <SkeletonLine w="w-16" />
          )}
          <OptionBadge option={formatOption} />
          <OptionBadge option={levelOption} />
        </div>

        {/* Title */}
        {title ? (
          <p className="text-[13px] font-bold text-neutral-800 leading-snug line-clamp-2">
            {title}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <SkeletonLine w="w-full" />
            <SkeletonLine w="w-3/4" />
          </div>
        )}

        {/* Short description */}
        {shortDesc ? (
          <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
            {shortDesc}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            <SkeletonLine w="w-full" />
            <SkeletonLine w="w-2/3" />
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-neutral-100" />

        {/* Meta: duration + schedule */}
        <div className="flex items-center gap-3 flex-wrap">
          {duration ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500">
              <Clock className="size-2.5 text-neutral-400" />
              {duration} hari
            </span>
          ) : (
            <SkeletonLine w="w-12" />
          )}
          {schedMeta ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500">
              {schedMeta.iconNode}
              {schedMeta.label}
            </span>
          ) : (
            <SkeletonLine w="w-14" />
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[9px] bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-1.5 py-0.5 font-medium"
              >
                <Tag className="size-2" />
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-[9px] text-neutral-400 font-medium self-center">
                +{tags.length - 4} lainnya
              </span>
            )}
          </div>
        )}

        {/* Highlight banner */}
        {highlight && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1.5">
            <Check className="size-3 text-amber-600 shrink-0" />
            <span className="text-[10px] font-semibold text-amber-800">
              {highlight}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Main page ────────────────────────────────────────────────────────────────

const CreateProgramPageClient = () => {
  const utils = trpc.useUtils();
  const { data: categories = [], isLoading: isLoadingCategories } =
    trpc.programs.getCategories.useQuery();
  const createProgram = trpc.programs.create.useMutation();

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

  const activateSection = trpc.programs.activateContentSection.useMutation();

  // Landing-page sections to create on submit. Sensible starter set — admin can
  // toggle any of them, and manage everything later in the Content tab.
  const [selectedContent, setSelectedContent] = useState<Set<string>>(
    new Set(["hero", "why", "benefits", "pricing", "faq", "cta"]),
  );


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
    media: !!(formState.errors.icon || formState.errors.tags),
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

  const imageUpload = useImageUpload({ maxSizeMB: 4 });

  async function onSubmit(values: ProgramCreateData) {
    setIsSubmitting(true);
    const toastId = toast.loading("Creating program...");
    try {
      const program = await createProgram.mutateAsync(values);

      if (imageUpload.file) {
        toast.loading("Uploading thumbnail...", { id: toastId });
        const res = await uploadFiles("programThumbnailUploader", {
          files: [imageUpload.file],
          input: { programId: program.id },
        });
        if (!res?.[0]) {
          throw new Error("Failed to upload thumbnail");
        }
      }

      for (const type of selectedContent) {
        await activateSection.mutateAsync({
          programId: program.id,
          sectionId: type,
          sectionType: type,
        });
      }
      
      utils.programs.getFiltered.invalidate();
      toast.success("Program created successfully", { id: toastId });

      setCreatedSlug(program.slug);
      setCreatedId(program.id);
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
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
                <Link href={`/dashboard/programs/${createdId}`}>
                  <Eye className="size-4" />
                  Lihat Detail
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
                    imageUpload={imageUpload}
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
                      <MediaSection
                        form={form}
                        color={section.color}
                        imageUpload={imageUpload}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </SectionCard>
                ))}

                {/* 04 — Landing page content */}
                <ContentCreateSection
                  value={selectedContent}
                  onChange={setSelectedContent}
                />

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
              <PreviewCard
                form={form}
                categories={categories}
                thumbnailUrl={imageUpload.previewUrl}
              />

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
