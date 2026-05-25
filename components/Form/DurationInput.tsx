"use client";

/**
 * DurationInput — numeric input + unit dropdown that stores TOTAL MINUTES.
 *
 * Enhancements:
 * - Default unit is "days" when no value is provided (create form UX)
 * - Smart unit parsing: stored as total minutes, displayed in best-fit unit
 * - Human-readable breakdown footer (e.g. "1 hr 30 min") on bottom-left
 * - Portal dropdown to escape overflow:hidden ancestors
 * - Full responsive + a11y support
 *
 * ─── Usage with React Hook Form ───────────────────────────────────────────────
 *
 * <Controller
 *   name="duration"
 *   control={form.control}
 *   render={({ field, fieldState }) => (
 *     <FormField label="Duration" required error={fieldState.error?.message}>
 *       <DurationInput
 *         value={field.value}
 *         onChange={field.onChange}
 *         onBlur={field.onBlur}
 *         error={!!fieldState.error}
 *       />
 *     </FormField>
 *   )}
 * />
 */

import { useState, useCallback, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Clock, ChevronDown, X, Timer } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Constants & Utilities ───────────────────────────────────────────────────

export type DurationUnit = "minutes" | "hours" | "days" | "weeks";

export interface DurationUnitDef {
  id: DurationUnit;
  label: string;
  labelPlural: string;
  multiplier: number; // in minutes
  shortLabel: string;
}

export const DURATION_UNITS: DurationUnitDef[] = [
  {
    id: "minutes",
    label: "Minute",
    labelPlural: "Minutes",
    multiplier: 1,
    shortLabel: "min",
  },
  {
    id: "hours",
    label: "Hour",
    labelPlural: "Hours",
    multiplier: 60,
    shortLabel: "hr",
  },
  {
    id: "days",
    label: "Day",
    labelPlural: "Days",
    multiplier: 1440,
    shortLabel: "day",
  },
  {
    id: "weeks",
    label: "Week",
    labelPlural: "Weeks",
    multiplier: 10080,
    shortLabel: "wk",
  },
];

/** Convert display value + unit → total minutes (stored value). */
export function durationToMinutes(
  displayValue: number | string,
  unit: DurationUnit,
): number | null {
  const n = Number(displayValue);
  if (!displayValue && displayValue !== 0) return null;
  if (Number.isNaN(n) || n < 0) return null;
  const def = DURATION_UNITS.find((u) => u.id === unit)!;
  return Math.round(n * def.multiplier);
}

/**
 * Best-practice parsing: given stored minutes, find the largest unit
 * that divides evenly with no remainder. Falls back to minutes.
 */
export function minutesToBestUnit(
  minutes: number | null | undefined,
  defaultUnit: DurationUnit = "days",
): { displayValue: number; unit: DurationUnit } {
  if (minutes == null) return { displayValue: 0, unit: defaultUnit };
  if (minutes === 0) return { displayValue: 0, unit: defaultUnit };

  // Walk from largest unit to smallest; pick first that divides evenly.
  for (const def of [...DURATION_UNITS].reverse()) {
    if (minutes % def.multiplier === 0) {
      return { displayValue: minutes / def.multiplier, unit: def.id };
    }
  }
  return { displayValue: minutes, unit: "minutes" };
}

/**
 * Duration breakdown segment used by the badge.
 */
export interface DurationPart {
  value: number;
  label: string; // e.g. "month", "day", "hour", "minute"
  labelPlural: string;
}

/**
 * Decompose total minutes into the largest meaningful units, including months.
 *
 * Hierarchy (largest → smallest):
 *   months (30 days = 43200 min) → days → hours → minutes
 *
 * We intentionally skip weeks in the breakdown so output reads naturally:
 *   "1 month 5 days" not "1 month 1 week"
 *   "35 days" → "1 month 5 days"
 *   "90 minutes" → "1 hour 30 minutes"
 *   "25 hours" → "1 day 1 hour"
 *
 * Returns an array of non-zero parts (max 2 largest) for compact display.
 */
export function decomposeMinutes(
  total: number | null | undefined,
): DurationPart[] {
  if (!total || total <= 0) return [];

  let remaining = total;

  const weeks = Math.floor(remaining / (60 * 24 * 7));
  remaining %= 60 * 24 * 7;

  const days = Math.floor(remaining / (60 * 24));
  remaining %= 60 * 24;

  const hours = Math.floor(remaining / 60);
  remaining %= 60;

  const minutes = remaining;

  const parts: DurationPart[] = [];

  if (weeks) {
    parts.push({
      value: weeks,
      label: "week",
      labelPlural: "weeks",
    });
  }

  if (days) {
    parts.push({
      value: days,
      label: "day",
      labelPlural: "days",
    });
  }

  if (hours) {
    parts.push({
      value: hours,
      label: "hour",
      labelPlural: "hours",
    });
  }

  if (minutes) {
    parts.push({
      value: minutes,
      label: "minute",
      labelPlural: "minutes",
    });
  }

  return parts;
}

/** Human-readable string. e.g. "1 hour 30 minutes", "1 month 5 days" */
export function formatHumanDuration(
  totalMinutes: number | null | undefined,
): string {
  return decomposeMinutes(totalMinutes)
    .map((p) => `${p.value} ${p.value === 1 ? p.label : p.labelPlural}`)
    .join(" ");
}

/** Display summary for read-only contexts. e.g. "3 Days" */
export function formatDurationSummary(
  totalMinutes: number | null | undefined,
): string {
  if (totalMinutes == null) return "—";
  const { displayValue, unit } = minutesToBestUnit(totalMinutes);
  const def = DURATION_UNITS.find((u) => u.id === unit)!;
  return `${displayValue} ${displayValue === 1 ? def.label : def.labelPlural}`;
}

// ─── Portal Dropdown Panel ────────────────────────────────────────────────────

interface DropdownPanelProps {
  open: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  value: DurationUnit;
  onChange: (unit: DurationUnit) => void;
  onClose: () => void;
}

function DropdownPanel({
  open,
  triggerRef,
  value,
  onChange,
  onClose,
}: DropdownPanelProps) {
  const [coords, setCoords] = useState({ top: 0, right: 0, width: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    function measure() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
        width: Math.max(rect.width + 32, 180),
      });
    }

    measure();
    window.addEventListener("scroll", measure, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", measure, { capture: true });
      window.removeEventListener("resize", measure);
    };
  }, [open, triggerRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="listbox"
          aria-label="Select duration unit"
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: coords.top,
            right: coords.right,
            zIndex: 9999,
            width: coords.width,
          }}
          className={cn(
            "overflow-hidden rounded-2xl border border-[#dbe7fb] bg-white",
            "shadow-[0_12px_40px_rgba(10,45,135,0.14),0_2px_8px_rgba(10,45,135,0.06)]",
          )}
        >
          <div className="p-1.5 space-y-0.5">
            {DURATION_UNITS.map((unit, i) => {
              const isSelected = unit.id === value;
              return (
                <motion.button
                  key={unit.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.16 }}
                  onClick={() => {
                    onChange(unit.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left",
                    "transition-colors duration-100 outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[#1a52c8]/30 focus-visible:ring-inset",
                    isSelected
                      ? "bg-[#1a52c8]/8 text-[#1a52c8]"
                      : "hover:bg-[#f4f8ff] text-[#0f172a]",
                  )}
                >
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-sm font-bold truncate leading-tight",
                        isSelected ? "text-[#1a52c8]" : "text-[#0f172a]",
                      )}
                    >
                      {unit.labelPlural}
                    </span>
                    <span className="text-[10px] text-[#9fb6d9] font-medium mt-0.5">
                      1 {unit.label} = {unit.multiplier.toLocaleString()} min
                    </span>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 28,
                        }}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a52c8]"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 10 8"
                          className="h-2.5 w-2.5 text-white fill-none stroke-current"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="1,4 3.5,6.5 9,1" />
                        </svg>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          <div className="border-t border-[#f0f4fc] mx-1.5 mb-1.5 pt-1.5 px-2.5 pb-1">
            <p className="text-[10px] font-semibold text-[#9fb6d9] uppercase tracking-wide">
              Stored as total minutes
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Unit Dropdown Trigger ────────────────────────────────────────────────────

interface UnitDropdownProps {
  value: DurationUnit;
  onChange: (unit: DurationUnit) => void;
  disabled?: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  hasValue: boolean;
}

function UnitDropdown({
  value,
  onChange,
  disabled,
  open,
  setOpen,
  hasValue,
}: UnitDropdownProps) {
  const selected = DURATION_UNITS.find((u) => u.id === value)!;
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Duration unit: ${selected.labelPlural}`}
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex h-full shrink-0 items-center justify-between gap-1.5 px-3",
          "min-w-[100px] sm:min-w-[112px]",
          "border-l-2 border-[#dbe7fb] rounded-r-[11px]",
          "text-sm font-bold transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1a52c8]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open
            ? "bg-[#eef3fd] text-[#1a52c8]"
            : hasValue
              ? "bg-[#f8faff] text-[#1a52c8] hover:bg-[#eef3fd]"
              : "bg-white text-[#4a6090] hover:bg-[#f4f8ff] hover:text-[#1a52c8]",
        )}
      >
        <span className="truncate leading-none">{selected.labelPlural}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex shrink-0"
          aria-hidden="true"
        >
          <ChevronDown className="h-3.5 w-3.5 text-[#7a90b8]" />
        </motion.span>
      </button>

      <DropdownPanel
        open={open}
        triggerRef={triggerRef}
        value={value}
        onChange={onChange}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

// ─── Human Duration Badge ─────────────────────────────────────────────────────

/**
 * Displays a decomposed human-readable breakdown of the entered duration.
 *
 * Show rules — badge is visible when ALL of the following are true:
 *   1. There's a non-zero value entered
 *   2. The decomposition produces ≥ 2 parts  OR  the single part uses a
 *      different unit than what the user selected (e.g. typed "25" hours →
 *      breakdown is "1 day 1 hour" — shown; typed "2" hours → "2 hours" — hidden)
 *
 * This means:
 *   • 90 minutes  → "1 hour 30 minutes"   ✓ shown  (2 parts)
 *   • 35 days     → "1 month 5 days"      ✓ shown  (2 parts)
 *   • 25 hours    → "1 day 1 hour"        ✓ shown  (2 parts)
 *   • 2 hours     → hidden               (1 part, same concept as selected unit)
 *   • 60 minutes  → hidden               (1 part: "1 hour" — clean single unit)
 *   • 1440 minutes → hidden              (1 part: "1 day" — clean)
 */
function HumanDurationBadge({
  totalMinutes,
  inputUnit,
}: {
  totalMinutes: number | null;
  inputUnit: DurationUnit;
}) {
  const parts = decomposeMinutes(totalMinutes);

  // Show logic:
  //   - 2+ parts always show  (e.g. "1 hour 30 minutes", "1 month 5 days")
  //   - 1 part shows only when it uses a DIFFERENT unit than what the user typed
  //     e.g. 60 min (typed in "minutes") → "1 hour"  → unit differs → SHOW
  //          2 hr  (typed in "hours")    → "2 hours" → same unit    → HIDE
  //          7 days (typed in "days")    → "7 days"  → same unit    → HIDE
  //   - 0 parts → HIDE

  if (parts.length === 0) return null;

  // For single-part results, only show if the unit is different from what user selected
  const singlePartDiffersFromInput =
    parts.length === 1 &&
    totalMinutes !== null &&
    (() => {
      // Recompute the single part's "unit class"
      const p = parts[0];
      // Map part label back to a rough unit bucket
      const labelToUnit: Record<string, DurationUnit> = {
        minute: "minutes",
        minutes: "minutes",

        hour: "hours",
        hours: "hours",

        day: "days",
        days: "days",

        week: "weeks",
        weeks: "weeks",
      };

      const partUnit = labelToUnit[p.label] ?? "minutes";

      return partUnit !== inputUnit;
    })();

  const shouldShow = parts.length >= 2 || singlePartDiffersFromInput;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-1 pt-1.5">
            {/* Left: decomposed breakdown chips */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <Timer
                className="h-3 w-3 text-[#1a52c8] shrink-0"
                aria-hidden="true"
              />
              {parts.map((part, i) => (
                <span key={part.label} className="flex items-center gap-1.5">
                  <motion.span
                    key={`${part.value}-${part.label}`}
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.04 }}
                    className="inline-flex items-baseline gap-0.5"
                  >
                    <span className="text-[12px] font-black text-[#1a52c8] tabular-nums leading-none">
                      {part.value}
                    </span>
                    <span className="text-[11px] font-semibold text-[#4a6090] leading-none">
                      {part.value === 1 ? part.label : part.labelPlural}
                    </span>
                  </motion.span>
                  {i < parts.length - 1 && (
                    <span
                      className="text-[10px] text-[#c0ceea] font-bold select-none"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Right: raw minutes */}
            <span className="text-[10px] font-semibold text-[#b0c4de] tabular-nums whitespace-nowrap shrink-0">
              {(totalMinutes ?? 0).toLocaleString()} min
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface DurationInputProps {
  /** Stored value: total minutes */
  value?: number | null;
  /** Called with total minutes on every change */
  onChange?: (totalMinutes: number | null) => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-describedby"?: string;
  /**
   * Default unit shown when no value is provided (create form UX).
   * @default "days"
   */
  defaultUnit?: DurationUnit;
}

export function DurationInput({
  value,
  onChange,
  onBlur,
  error,
  disabled,
  placeholder = "0",
  id: idProp,
  "aria-describedby": ariaDescribedby,
  defaultUnit = "days", // ← feedback #1: default to "days" on create forms
}: DurationInputProps) {
  // ── Derive initial display state from the stored minutes ──────────────────
  // Best-practice: always store as minutes; parse to best-fit unit for display.
  // If no value exists (create form), use defaultUnit with empty input.
  const getInitialState = () => {
    if (value == null) return { displayValue: "", unit: defaultUnit };
    const { displayValue, unit } = minutesToBestUnit(value, defaultUnit);
    return { displayValue: String(displayValue), unit };
  };

  const init = getInitialState();
  const [displayValue, setDisplayValue] = useState<string>(init.displayValue);
  const [unit, setUnit] = useState<DurationUnit>(init.unit);
  const [unitOpen, setUnitOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const inputId = idProp ?? `${uid}-duration`;

  // ── Sync on external value change (e.g. form.reset()) ────────────────────
  const prevValueRef = useRef<number | null | undefined>(value);
  useEffect(() => {
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;
    if (!focused) {
      if (value == null) {
        setDisplayValue("");
        setUnit(defaultUnit);
      } else {
        const { displayValue: d, unit: u } = minutesToBestUnit(
          value,
          defaultUnit,
        );
        setDisplayValue(String(d));
        setUnit(u);
      }
    }
  }, [value, focused, defaultUnit]);

  // ── Close dropdown on outside click / Escape ──────────────────────────────
  useEffect(() => {
    if (!unitOpen) return;
    const onMouse = (e: MouseEvent) => {
      const target = e.target as Node;
      const panel = document.querySelector('[role="listbox"]');
      if (containerRef.current?.contains(target) || panel?.contains(target))
        return;
      setUnitOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUnitOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [unitOpen]);

  // ── Emit helpers ─────────────────────────────────────────────────────────

  const emitChange = useCallback(
    (raw: string, u: DurationUnit) => {
      onChange?.(durationToMinutes(raw, u));
    },
    [onChange],
  );

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive integers
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setDisplayValue(raw);
    emitChange(raw, unit);
  };

  const handleUnitChange = (newUnit: DurationUnit) => {
    setUnit(newUnit);
    emitChange(displayValue, newUnit);
  };

  const handleClear = () => {
    setDisplayValue("");
    setUnit(defaultUnit);
    onChange?.(null);
    inputRef.current?.focus();
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const totalMinutes = durationToMinutes(displayValue, unit);
  const hasValue = displayValue !== "" && displayValue !== "0";

  const ringClass = error
    ? focused
      ? "border-red-400 shadow-[0_0_0_4px_rgba(239,68,68,0.10)]"
      : "border-red-300 hover:border-red-400"
    : focused || unitOpen
      ? "border-[#1a52c8] shadow-[0_0_0_4px_rgba(26,82,200,0.10)]"
      : "border-[#dbe7fb] hover:border-[#9fb6d9]";

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full space-y-1">
        {/* ── Control pill ──────────────────────────────────────────────── */}
        <div ref={containerRef} className="relative w-full">
          <div
            className={cn(
              "flex h-[52px] w-full rounded-xl border-2 bg-white",
              "transition-[border-color,box-shadow] duration-150",
              ringClass,
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {/* Left side: clock icon + number input + clear button */}
            <div className="flex flex-1 min-w-0 items-center gap-2 pl-3.5 pr-2 overflow-hidden rounded-l-[11px]">
              <motion.span
                animate={{
                  color:
                    focused || unitOpen
                      ? error
                        ? "#f87171"
                        : "#1a52c8"
                      : "#9fb6d9",
                }}
                transition={{ duration: 0.15 }}
                className="shrink-0 flex"
                aria-hidden="true"
              >
                <Clock className="h-[18px] w-[18px]" />
              </motion.span>

              <input
                ref={inputRef}
                id={inputId}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={disabled}
                value={displayValue}
                onChange={handleNumberChange}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  onBlur?.();
                }}
                placeholder={placeholder}
                aria-label="Duration value"
                aria-describedby={ariaDescribedby}
                aria-invalid={error ? true : undefined}
                className={cn(
                  "h-full flex-1 min-w-0 bg-transparent",
                  "text-base sm:text-sm font-bold text-[#0f172a] tabular-nums",
                  "outline-none placeholder:font-normal placeholder:text-[#c0ceea]",
                  "disabled:cursor-not-allowed",
                )}
              />

              <AnimatePresence>
                {hasValue && !disabled && (
                  <motion.button
                    type="button"
                    aria-label="Clear duration"
                    onClick={handleClear}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      duration: 0.12,
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                      "text-[#9fb6d9] hover:bg-red-50 hover:text-red-400",
                      "transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300",
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Right: unit dropdown */}
            <UnitDropdown
              value={unit}
              onChange={handleUnitChange}
              disabled={disabled}
              open={unitOpen}
              setOpen={setUnitOpen}
              hasValue={hasValue}
            />
          </div>
        </div>
        {/* ── Footer: human-readable breakdown ──────────────────────────── */}

        <HumanDurationBadge totalMinutes={totalMinutes} inputUnit={unit} />
      </div>
    </MotionConfig>
  );
}

export default DurationInput;
