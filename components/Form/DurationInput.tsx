"use client";

/**
 * DurationInput — numeric input + unit dropdown that stores TOTAL MINUTES.
 *
 * The unit dropdown renders via createPortal at document.body, so it escapes
 * any overflow:hidden / overflow:clip ancestor (e.g. SectionCard).
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
import { Clock, ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Constants & Utilities ───────────────────────────────────────────────────

export type DurationUnit = "minutes" | "hours" | "days" | "weeks";

export interface DurationUnitDef {
  id: DurationUnit;
  label: string;
  labelPlural: string;
  multiplier: number;
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

export const DURATION_UNIT_OPTIONS = DURATION_UNITS.map((u) => ({
  id: u.id,
  label: u.labelPlural,
}));

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

export function minutesToBestUnit(minutes: number | null | undefined): {
  displayValue: number;
  unit: DurationUnit;
} {
  if (minutes == null || minutes === 0)
    return { displayValue: 0, unit: "minutes" };
  for (const def of [...DURATION_UNITS].reverse()) {
    if (minutes % def.multiplier === 0) {
      return { displayValue: minutes / def.multiplier, unit: def.id };
    }
  }
  return { displayValue: minutes, unit: "minutes" };
}

export function formatDurationSummary(
  totalMinutes: number | null | undefined,
): string {
  if (totalMinutes == null) return "—";
  const { displayValue, unit } = minutesToBestUnit(totalMinutes);
  const def = DURATION_UNITS.find((u) => u.id === unit)!;
  return `${displayValue} ${displayValue === 1 ? def.label : def.labelPlural}`;
}

// ─── Portal panel ─────────────────────────────────────────────────────────────
// Teleports to document.body so no overflow:hidden ancestor can clip it.

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
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    function measure() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        // Place panel directly below the trigger, accounting for page scroll
        top: rect.bottom + window.scrollY + 6,
        // Right-align to trigger's right edge
        right: window.innerWidth - rect.right,
      });
    }

    measure();

    // Re-measure on scroll/resize so the panel tracks while the page scrolls
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
          initial={{ opacity: 0, y: -4, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.985 }}
          transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: coords.top,
            right: coords.right,
            zIndex: 9999,
            width: 176,
          }}
          className={cn(
            "overflow-hidden rounded-xl border border-[#dbe7fb] bg-white",
            "shadow-[0_8px_32px_rgba(10,45,135,0.13),0_2px_8px_rgba(10,45,135,0.07)]",
          )}
        >
          <div className="p-1.5 space-y-0.5">
            {DURATION_UNITS.map((unit) => {
              const isSelected = unit.id === value;
              return (
                <button
                  key={unit.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(unit.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left",
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
                        "text-sm font-semibold truncate",
                        isSelected && "text-[#1a52c8]",
                      )}
                    >
                      {unit.labelPlural}
                    </span>
                    <span className="text-[10px] text-[#7a90b8] font-medium">
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
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#dbe7fb] px-3 py-1.5">
            <p className="text-[10px] font-medium text-[#7a90b8]">
              Value stored as total minutes
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Unit dropdown trigger ────────────────────────────────────────────────────

interface UnitDropdownProps {
  value: DurationUnit;
  onChange: (unit: DurationUnit) => void;
  disabled?: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
}

function UnitDropdown({
  value,
  onChange,
  disabled,
  open,
  setOpen,
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
          "relative flex h-full w-[108px] shrink-0 items-center justify-between gap-1.5 px-3",
          "border-l-2 border-[#dbe7fb] rounded-r-[10px]",
          "text-sm font-bold text-[#0f172a] transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1a52c8]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open
            ? "bg-[#f4f8ff] text-[#1a52c8]"
            : "bg-white hover:bg-[#f4f8ff] hover:text-[#1a52c8]",
        )}
      >
        <span className="truncate leading-none">{selected.labelPlural}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[#7a90b8] transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Panel renders at document.body — zero clipping risk */}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export interface DurationInputProps {
  value?: number | null;
  onChange?: (totalMinutes: number | null) => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-describedby"?: string;
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
}: DurationInputProps) {
  const { displayValue: initDisplay, unit: initUnit } =
    minutesToBestUnit(value);

  const [displayValue, setDisplayValue] = useState<string>(
    value != null ? String(initDisplay) : "",
  );
  const [unit, setUnit] = useState<DurationUnit>(initUnit);
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
      const { displayValue: d, unit: u } = minutesToBestUnit(value);
      setDisplayValue(value != null ? String(d) : "");
      setUnit(u);
    }
  }, [value, focused]);

  // ── Close on outside click / Escape ──────────────────────────────────────
  // Checks both the trigger container and the portal panel (separate DOM trees).
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

  // ── Handlers ─────────────────────────────────────────────────────────────

  const emitChange = useCallback(
    (raw: string, u: DurationUnit) => {
      onChange?.(durationToMinutes(raw, u));
    },
    [onChange],
  );

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    onChange?.(null);
    inputRef.current?.focus();
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const totalMinutes = durationToMinutes(displayValue, unit);
  const showSummary =
    displayValue !== "" && totalMinutes != null && unit !== "minutes";

  const ringClass = error
    ? focused
      ? "border-red-400 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
      : "border-red-300 hover:border-red-400"
    : focused || unitOpen
      ? "border-[#1a52c8] shadow-[0_0_0_4px_rgba(26,82,200,0.10)]"
      : "border-[#dbe7fb] hover:border-[#9fb6d9]";

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-1.5">
        {/* ── Control pill ──────────────────────────────────────────────── */}
        <div ref={containerRef} className="relative">
          <div
            className={cn(
              // No overflow-hidden on the outer wrapper — clipping happens only
              // on the left child so the trigger button border-radius is preserved.
              "flex h-[50px] w-full rounded-xl border-2 bg-white",
              "transition-[border-color,box-shadow] duration-150",
              ringClass,
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {/* Left side: clock + number + clear */}
            <div className="flex flex-1 min-w-0 items-center gap-2.5 pl-3.5 pr-2 overflow-hidden rounded-l-[10px]">
              <Clock
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-150",
                  focused || unitOpen
                    ? error
                      ? "text-red-400"
                      : "text-[#1a52c8]"
                    : "text-[#7a90b8]",
                )}
                aria-hidden="true"
              />

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
                  "h-full flex-1 min-w-0 bg-transparent text-sm font-semibold text-[#0f172a]",
                  "outline-none placeholder:font-normal placeholder:text-[#7a90b8]",
                  "disabled:cursor-not-allowed",
                )}
              />

              <AnimatePresence>
                {displayValue && !disabled && (
                  <motion.button
                    type="button"
                    aria-label="Clear duration"
                    onClick={handleClear}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                      "text-[#7a90b8] hover:bg-red-50 hover:text-red-400",
                      "transition-colors duration-100",
                    )}
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Right side: unit selector — panel teleports to body */}
            <UnitDropdown
              value={unit}
              onChange={handleUnitChange}
              disabled={disabled}
              open={unitOpen}
              setOpen={setUnitOpen}
            />
          </div>
        </div>

        {/* ── Conversion summary ─────────────────────────────────────────── */}
        <AnimatePresence>
          {showSummary && totalMinutes != null && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 px-1">
                <div
                  className="h-px flex-1 bg-gradient-to-r from-[#1a52c8]/20 to-transparent"
                  aria-hidden="true"
                />
                <p className="text-[11px] font-semibold text-[#7a90b8]">
                  <span className="text-[#3a5080] font-black tabular-nums">
                    {totalMinutes.toLocaleString()}
                  </span>{" "}
                  total minutes
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

export default DurationInput;
