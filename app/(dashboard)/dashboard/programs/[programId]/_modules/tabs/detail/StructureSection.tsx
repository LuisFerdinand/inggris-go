// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/detail/StructureSection.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  CalendarClock,
  Repeat,
  Globe,
  Wifi,
  MapPin,
  Layers,
  Clock,
  Users,
  Lock,
  CheckCircle2,
  X,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  ReadField,
  FieldWrap,
  StickySaveBar,
  InfoNotice,
  SectionDivider,
  MetaPill,
  LEVEL_LABELS,
  FORMAT_LABELS,
  LEVEL_COLORS,
  type DetailData,
} from ".";

/* ─────────────────────────────────────────────────────────────
   SCHEMA
───────────────────────────────────────────────────────────── */

const schema = z.object({
  scheduleType: z.enum(["permanent", "scheduled"]),
  registrationType: z.enum(["online", "offline"]),
  format: z.enum(["online", "offline", "hybrid"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  // stored as total minutes in DB; null = not set
  duration: z.number().int().min(1).nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─────────────────────────────────────────────────────────────
   DURATION UTILITIES  (same system as reference, simpler API)
───────────────────────────────────────────────────────────── */

type DurationUnit = "minutes" | "hours" | "days" | "weeks";

const UNITS: {
  id: DurationUnit;
  label: string;
  plural: string;
  factor: number;
}[] = [
  { id: "minutes", label: "min", plural: "minutes", factor: 1 },
  { id: "hours", label: "hr", plural: "hours", factor: 60 },
  { id: "days", label: "day", plural: "days", factor: 1440 },
  { id: "weeks", label: "wk", plural: "weeks", factor: 10080 },
];

function toMinutes(val: string, unit: DurationUnit): number | null {
  const n = Number(val);
  if (!val || isNaN(n) || n <= 0) return null;
  return Math.round(n * UNITS.find((u) => u.id === unit)!.factor);
}

/** Pick the largest unit that divides evenly */
function bestUnit(
  minutes: number | null | undefined,
  fallback: DurationUnit = "days",
): { display: string; unit: DurationUnit } {
  if (!minutes) return { display: "", unit: fallback };
  for (const u of [...UNITS].reverse()) {
    if (minutes % u.factor === 0)
      return { display: String(minutes / u.factor), unit: u.id };
  }
  return { display: String(minutes), unit: "minutes" };
}

/** Human breakdown: "1 day 12 hours" etc. Only shown when non-trivial. */
function humanBreakdown(totalMinutes: number | null): string {
  if (!totalMinutes || totalMinutes <= 0) return "";
  let rem = totalMinutes;
  const weeks = Math.floor(rem / 10080);
  rem %= 10080;
  const days = Math.floor(rem / 1440);
  rem %= 1440;
  const hours = Math.floor(rem / 60);
  rem %= 60;
  const mins = rem;

  const parts: string[] = [];
  if (weeks) parts.push(`${weeks}wk`);
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}hr`);
  if (mins) parts.push(`${mins}min`);

  return parts.slice(0, 2).join(" ");
}

/* ─────────────────────────────────────────────────────────────
   DURATION INPUT
   - Stores total minutes (matches DB schema)
   - Inline unit pills; no portal needed
   - Clear button, human breakdown footer
   - Simple, clean — no over-engineering
───────────────────────────────────────────────────────────── */

interface DurationInputProps {
  value?: number | null;
  onChange?: (totalMinutes: number | null) => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
  defaultUnit?: DurationUnit;
}

function DurationInput({
  value,
  onChange,
  onBlur,
  error,
  disabled,
  defaultUnit = "days",
}: DurationInputProps) {
  const init = bestUnit(value, defaultUnit);

  const [displayVal, setDisplayVal] = useState(init.display);
  const [unit, setUnit] = useState<DurationUnit>(init.unit);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const prevValue = useRef(value);

  // Sync ketika form.reset() dipanggil dari luar
  useEffect(() => {
    if (value === prevValue.current) return;

    prevValue.current = value;

    if (!focused) {
      const { display, unit: u } = bestUnit(value, defaultUnit);

      setDisplayVal(display);
      setUnit(u);
    }
  }, [value, focused, defaultUnit]);

  const emit = useCallback(
    (raw: string, u: DurationUnit) => {
      onChange?.(toMinutes(raw, u));
    },
    [onChange],
  );

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");

    setDisplayVal(raw);

    emit(raw, unit);
  }

  function handleUnit(u: DurationUnit) {
    setUnit(u);

    emit(displayVal, u);
  }

  function handleClear() {
    setDisplayVal("");
    setUnit(defaultUnit);

    onChange?.(null);

    inputRef.current?.focus();
  }

  const totalMinutes = toMinutes(displayVal, unit);

  const breakdown = humanBreakdown(totalMinutes);

  const hasValue = !!displayVal && displayVal !== "0";

  // Tampilkan breakdown hanya jika memberi informasi tambahan
  const showBreakdown = (() => {
    if (!breakdown || !totalMinutes) return false;

    const parts = breakdown.split(" ");

    if (parts.length >= 2) return true;

    const singleUnit = UNITS.find(
      (u) =>
        breakdown.endsWith(u.label) ||
        (breakdown.endsWith("min") && u.id === "minutes"),
    );

    return singleUnit?.id !== unit;
  })();

  return (
    <div className="flex flex-col gap-1.5">
      {/* Input Container */}
      <div
        className={cn(
          "group flex items-stretch overflow-hidden rounded-2xl border bg-white transition-all duration-200",
          error
            ? focused
              ? "border-red-400 shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
              : "border-red-300"
            : focused
              ? "border-neutral-400 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]"
              : "border-neutral-200 hover:border-neutral-300",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        {/* Icon */}
        <div className="flex items-center pl-3 pr-2 text-neutral-400">
          <Clock3 className="size-4" />
        </div>

        {/* Number Input */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          value={displayVal}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);

            onBlur?.();
          }}
          placeholder="Masukkan durasi"
          className="flex-1 min-w-0 bg-transparent py-3 text-[14px] font-semibold text-neutral-800 placeholder:font-normal placeholder:text-neutral-300 outline-none tabular-nums"
        />

        {/* Clear */}
        <AnimatePresence>
          {hasValue && (
            <motion.button
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.14 }}
              className="my-auto mr-1 flex size-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <X className="size-3.5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="my-2 w-px flex-shrink-0 bg-neutral-200" />

        {/* Unit Selector */}
        <div className="flex items-center gap-1 px-1.5 pr-2">
          {UNITS.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleUnit(u.id)}
              disabled={disabled}
              className={cn(
                "rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-all duration-150",
                unit === u.id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800",
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Information */}
      <AnimatePresence mode="wait">
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: -2, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -2, height: 0 }}
            transition={{
              duration: 0.18,
              ease: "easeOut",
            }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-1.5 pl-1">
              <div className="size-1 rounded-full bg-neutral-300" />

              <p className="text-[11px] font-medium text-neutral-500">
                Estimasi durasi:{" "}
                <span className="text-neutral-700">{breakdown}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SEGMENTED CONTROL
───────────────────────────────────────────────────────────── */

interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegOption<T>[];
  disabled?: boolean;
}) {
  return (
    <div className="relative flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200/80">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled || opt.disabled}
            onClick={() => !disabled && !opt.disabled && onChange(opt.value)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[9px]",
              "text-[12px] font-semibold transition-all duration-150 z-10",
              active
                ? "text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700",
              (disabled || opt.disabled) && "cursor-not-allowed opacity-50",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${options.map((o) => o.value).join("-")}`}
                className="absolute inset-0 bg-white rounded-[9px] shadow-sm border border-neutral-200"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LEVEL SELECTOR  (3 coloured cards)
───────────────────────────────────────────────────────────── */

const LEVEL_CONFIG = {
  beginner: {
    label: "Beginner",
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  intermediate: {
    label: "Intermediate",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  advanced: {
    label: "Advanced",
    color: "red",
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    dot: "bg-red-400",
  },
} as const;

function LevelSelector({
  value,
  onChange,
}: {
  value: "beginner" | "intermediate" | "advanced";
  onChange: (v: "beginner" | "intermediate" | "advanced") => void;
}) {
  return (
    <div className="flex gap-2">
      {(
        Object.entries(LEVEL_CONFIG) as [
          keyof typeof LEVEL_CONFIG,
          (typeof LEVEL_CONFIG)[keyof typeof LEVEL_CONFIG],
        ][]
      ).map(([lvl, cfg]) => {
        const active = value === lvl;
        return (
          <button
            key={lvl}
            type="button"
            onClick={() => onChange(lvl)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border-[1.5px] transition-all duration-150",
              active
                ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full transition-colors",
                active ? cfg.dot : "bg-neutral-300",
              )}
            />
            <span className="text-[11px] font-bold leading-none">
              {cfg.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCHEDULE NOTICE
───────────────────────────────────────────────────────────── */

function ScheduleNotice({ scheduleType }: { scheduleType: string }) {
  const isScheduled = scheduleType === "scheduled";
  return (
    <motion.div
      key={scheduleType}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed",
        isScheduled
          ? "bg-neutral-50 border-neutral-200 text-neutral-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-800",
      )}
    >
      <div className="mt-0.5 flex-shrink-0">
        {isScheduled ? (
          <CalendarClock className="size-3.5 text-neutral-500" />
        ) : (
          <CheckCircle2 className="size-3.5 text-emerald-500" />
        )}
      </div>
      <p>
        {isScheduled ? (
          <>
            <span className="font-semibold">Program Scheduled — </span>
            Paket harga dikelola per batch. Buka tab <strong>
              Batches
            </strong>{" "}
            untuk menambahkan batch baru.
          </>
        ) : (
          <>
            <span className="font-semibold">Program Permanent — </span>
            Paket harga dikelola langsung tanpa batch. Buka tab{" "}
            <strong>Packages</strong> untuk mengatur harga.
          </>
        )}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FORMAT BADGE HELPER
───────────────────────────────────────────────────────────── */

function FormatIcon({ format }: { format: string }) {
  if (format === "online") return <Wifi className="size-3" />;
  if (format === "offline") return <MapPin className="size-3" />;
  return <Layers className="size-3" />;
}

/* ─────────────────────────────────────────────────────────────
   READ MODE
───────────────────────────────────────────────────────────── */

function ReadMode({ data }: { data: DetailData }) {
  const { display: dDisplay, unit: dUnit } = bestUnit(data.duration);
  const unitDef = UNITS.find((u) => u.id === dUnit);

  return (
    <div className="flex flex-col gap-5">
      <ScheduleNotice scheduleType={data.scheduleType} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
        <ReadField label="Tipe Jadwal">
          <MetaPill>
            {data.scheduleType === "scheduled" ? (
              <>
                <CalendarClock className="size-3" /> Scheduled
              </>
            ) : (
              <>
                <Repeat className="size-3" /> Permanent
              </>
            )}
          </MetaPill>
        </ReadField>

        <ReadField label="Format">
          <MetaPill>
            <FormatIcon format={data.format} />
            {FORMAT_LABELS[data.format] ?? data.format}
          </MetaPill>
        </ReadField>

        <ReadField label="Level">
          <MetaPill className={LEVEL_COLORS[data.level]}>
            <span
              className={cn(
                "size-1.5 rounded-full",
                data.level === "beginner"
                  ? "bg-emerald-500"
                  : data.level === "intermediate"
                    ? "bg-amber-500"
                    : "bg-red-500",
              )}
            />
            {LEVEL_LABELS[data.level] ?? data.level}
          </MetaPill>
        </ReadField>

        <ReadField label="Registrasi">
          <MetaPill>
            {data.registrationType === "online" ? (
              <>
                <Globe className="size-3" /> Online
              </>
            ) : (
              <>
                <Users className="size-3" /> Offline
              </>
            )}
          </MetaPill>
        </ReadField>

        <ReadField label="Estimasi Durasi" empty={!data.duration}>
          {data.duration ? (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-neutral-400" />
              <span className="text-[13px] text-neutral-700 font-semibold">
                {dDisplay}{" "}
                <span className="font-normal text-neutral-500">
                  {Number(dDisplay) === 1 ? unitDef?.label : unitDef?.plural}
                </span>
              </span>
            </div>
          ) : null}
        </ReadField>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EDIT MODE
───────────────────────────────────────────────────────────── */

function EditMode({
  data,
  form,
}: {
  data: DetailData;
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  const {
    control,
    formState: { errors },
    watch,
  } = form;
  const scheduleType = watch("scheduleType");
  const isScheduleLocked = data.hasEnrollments || data.hasPackages;

  return (
    <div className="flex flex-col gap-5">
      {/* Schedule type */}
      <FieldWrap label="Tipe Jadwal" required>
        <Controller
          name="scheduleType"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                disabled={isScheduleLocked}
                options={[
                  {
                    value: "permanent" as const,
                    label: "Permanent",
                    icon: <Repeat className="size-3.5" />,
                  },
                  {
                    value: "scheduled" as const,
                    label: "Scheduled",
                    icon: <CalendarClock className="size-3.5" />,
                  },
                ]}
              />
              {isScheduleLocked && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <Lock className="size-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    Tipe jadwal tidak bisa diubah karena program sudah memiliki
                    paket atau pendaftar.
                  </p>
                </div>
              )}
            </div>
          )}
        />
      </FieldWrap>

      {/* Live notice */}
      <AnimatePresence mode="wait">
        <ScheduleNotice key={scheduleType} scheduleType={scheduleType} />
      </AnimatePresence>

      <SectionDivider label="Detail Program" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Format */}
        <FieldWrap label="Format Pengajaran" required>
          <Controller
            name="format"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  {
                    value: "online" as const,
                    label: "Online",
                    icon: <Wifi className="size-3.5" />,
                  },
                  {
                    value: "offline" as const,
                    label: "Offline",
                    icon: <MapPin className="size-3.5" />,
                  },
                  {
                    value: "hybrid" as const,
                    label: "Hybrid",
                    icon: <Layers className="size-3.5" />,
                  },
                ]}
              />
            )}
          />
        </FieldWrap>

        {/* Registrasi */}
        <FieldWrap label="Tipe Registrasi" required>
          <Controller
            name="registrationType"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  {
                    value: "online" as const,
                    label: "Online",
                    icon: <Globe className="size-3.5" />,
                  },
                  {
                    value: "offline" as const,
                    label: "Offline",
                    icon: <Users className="size-3.5" />,
                  },
                ]}
              />
            )}
          />
        </FieldWrap>

        {/* Level */}
        <FieldWrap label="Tingkat Kesulitan" required>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <LevelSelector value={field.value} onChange={field.onChange} />
            )}
          />
        </FieldWrap>

        {/* Duration */}
        <FieldWrap
          label="Estimasi Durasi"
          hint="Opsional — disimpan dalam menit"
          error={errors.duration?.message}
        >
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <DurationInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors.duration}
                defaultUnit="days"
              />
            )}
          />
        </FieldWrap>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STRUCTURE SECTION — ROOT
───────────────────────────────────────────────────────────── */

interface StructureSectionProps {
  data: DetailData;
  programId: string;
}

export function StructureSection({ data, programId }: StructureSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();

  const updateStructure = trpc.programs.updateStructure.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.programs.getDetail.invalidate({ id: programId }),
        utils.programs.getFiltered.invalidate(),
      ]);

      toast.success("Struktur program berhasil disimpan");
      setIsEditing(false);
      form.reset(form.getValues());
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal menyimpan perubahan");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduleType: data.scheduleType,
      registrationType: data.registrationType,
      format: data.format,
      level: data.level,
      duration: data.duration,
    },
  });

  const { isDirty, isSubmitting } = form.formState;
  const isPending = isSubmitting || updateStructure.isPending;

  async function onSubmit(values: FormValues) {
    await updateStructure.mutateAsync({ id: programId, ...values });
  }

  function handleCancel() {
    form.reset();
    setIsEditing(false);
  }

  return (
    <>
      <SectionCard
        icon={<LayoutGrid className="size-4" />}
        title="Struktur Program"
        description="Arsitektur jadwal, format pengajaran, level, dan durasi program."
        isEditing={isEditing}
        isDirty={isDirty}
        isSubmitting={isPending}
        onEdit={() => setIsEditing(true)}
        onSave={form.handleSubmit(onSubmit)}
        onCancel={handleCancel}
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <EditMode data={data} form={form} />
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <ReadMode data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      <AnimatePresence>
        {isEditing && (
          <StickySaveBar
            isDirty={isDirty}
            isSubmitting={isPending}
            sectionTitle="Struktur Program"
            onCancel={handleCancel}
            onSave={form.handleSubmit(onSubmit)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
