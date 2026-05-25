"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
  memo,
  useId,
} from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Phone,
  Search,
  X,
  Upload,
  ImageIcon,
  Circle,
  AlertCircle,
  CircleAlert,
  Loader2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "../Icon";

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Centralised so you change them in one place.
export const tokens = {
  blue: "#1a52c8",
  focusRing: "focus:shadow-[0_0_0_4px_rgba(26,82,200,0.1)]",
  focusRingError: "focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]",
  inputBase: [
    "w-full h-[50px] px-4 rounded-xl border-2 border-slate-200 bg-white",
    "text-slate-800 text-sm font-medium placeholder:text-slate-400 placeholder:font-normal",
    "transition-[border-color,box-shadow] duration-150 outline-none",
    "hover:border-slate-300",
    "focus:border-[#1a52c8] focus:shadow-[0_0_0_4px_rgba(26,82,200,0.1)]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50",
  ].join(" "),
  inputError: [
    "border-red-300 bg-red-50/20",
    "hover:border-red-300",
    "focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]",
  ].join(" "),
} as const;

function usePortalCoords(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
) {
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    right: 0,
    width: 0,
  });

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    function measure() {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: r.bottom + window.scrollY + 6,
        left: r.left + window.scrollX,
        right: window.innerWidth - r.right,
        width: r.width,
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

  return coords;
}

// ─── Primitives ───────────────────────────────────────────────────────────────

export function FieldLabel({
  children,
  required,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-[11px] font-black text-slate-500 uppercase tracking-wider",
        className,
      )}
    >
      {children}
      {required && (
        <span className="text-red-400 ml-0.5" aria-hidden="true">
          *
        </span>
      )}
      {required && <span className="sr-only">(required)</span>}
    </label>
  );
}

export function FieldHint({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <p id={id} className="text-[11px] text-slate-400 leading-relaxed">
      {children}
    </p>
  );
}
export function FieldError({ message, id }: { message?: string; id?: string }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5 text-[12px] font-medium text-red-600"
        >
          <CircleAlert
            className="h-3.5 w-3.5 flex-shrink-0"
            aria-hidden="true"
          />

          <span>{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/**
 * FormField — wraps label + input + hint + error with consistent spacing.
 * Use this as the outermost container for every field.
 */
export function FormField({
  label,
  required,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const hintId = hint && htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <FieldLabel htmlFor={htmlFor} required={required}>
          {label}
        </FieldLabel>
      )}
      {/* Pass ids down via context or clone — here we just render children */}
      {children}
      {hint && !error && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError message={error} id={errorId} />}
    </div>
  );
}

/**
 * InputWrapper — handles the icon slot + relative positioning for inputs.
 */
export function InputWrapper({
  children,
  leadingIcon,
  trailingIcon,
  className,
}: {
  children: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {leadingIcon && (
        <div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10 flex items-center"
          aria-hidden="true"
        >
          {leadingIcon}
        </div>
      )}
      {children}
      {trailingIcon && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
          {trailingIcon}
        </div>
      )}
    </div>
  );
}

// ─── StyledInput ──────────────────────────────────────────────────────────────
export const StyledInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    icon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    error?: boolean;
  }
>(function StyledInput(
  { icon, maxLength, trailingIcon, error, className, type, ...props },
  ref,
) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "number") {
      const allowed = [
        "Backspace",
        "Delete",
        "Tab",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        ".",
        "-",
      ];
      if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    }
    props.onKeyDown?.(e);
  };

  return (
    <InputWrapper leadingIcon={icon} trailingIcon={trailingIcon}>
      <input
        ref={ref}
        {...props}
        type={type === "number" ? "text" : type}
        inputMode={type === "number" ? "numeric" : props.inputMode}
        onKeyDown={handleKeyDown}
        aria-invalid={error ? true : undefined}
        className={cn(
          tokens.inputBase,
          icon && "pl-10",
          trailingIcon && "pr-10",
          error && tokens.inputError,
          className,
        )}
      />
    </InputWrapper>
  );
});

// ─── PasswordInput ────────────────────────────────────────────────────────────
export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function PasswordInput({ error, className, ...props }, ref) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        {...props}
        type={show ? "text" : "password"}
        aria-invalid={error ? true : undefined}
        className={cn(
          tokens.inputBase,
          "pr-11",
          error && tokens.inputError,
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});

export interface SelectOption {
  /** Unique identifier for the option */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon element */
  icon?: string;
  /** Short description shown as tooltip on hover */
  shortDesc?: string;
  /** Optional group/category this option belongs to */
  group?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Optional color accent (hex) for tag/badge display */
  color?: string;
  /** Any extra metadata you want attached */
  meta?: Record<string, unknown>;
}

export type SelectVariant = "cards" | "dropdown" | "auto";
export type CardColumns = 1 | 2 | 3 | 4 | "auto";

interface SelectBaseProps {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Force display variant. Default: "auto" */
  variant?: SelectVariant;
  cardColumns?: CardColumns;
  showCardDesc?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  maxSelected?: number;
  showBulkActions?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export interface SelectSingleProps extends SelectBaseProps {
  multi?: false;
  value?: string | null;
  onChange?: (id: string | null, option: SelectOption | null) => void;
}
export interface SelectMultiProps extends SelectBaseProps {
  multi: true;
  value?: string[];
  onChange?: (ids: string[], options: SelectOption[]) => void;
}

export type SelectProps = SelectSingleProps | SelectMultiProps;

const AUTO_CARD_THRESHOLD = 6;

function resolveVariant(
  variant: SelectVariant,
  optionCount: number,
): "cards" | "dropdown" {
  if (variant === "auto")
    return optionCount <= AUTO_CARD_THRESHOLD ? "cards" : "dropdown";
  return variant;
}

function resolveColumns(cardColumns: CardColumns, optionCount: number): number {
  if (cardColumns !== "auto") return cardColumns;
  if (optionCount <= 2) return 2;
  if (optionCount <= 4) return 2;
  return 3;
}

interface CardOptionProps {
  option: SelectOption;
  selected: boolean;
  multi?: boolean;
  onSelect: (opt: SelectOption) => void;
  showDesc?: boolean;
  colCount: number;
}

function CardOption({
  option,
  selected,
  multi,
  onSelect,
  showDesc,
  colCount,
}: CardOptionProps) {
  const hasDesc = !!option.shortDesc;

  // Derive tint from color prop or fall back to brand blue
  const accent = option.color ?? "#1a52c8";
  const accentAlpha = `${accent}1a`; // ~10% opacity

  return (
    <TooltipProvider delayDuration={400}>
      <motion.button
        type="button"
        role={multi ? "option" : "option"}
        aria-selected={selected}
        aria-disabled={option.disabled}
        disabled={option.disabled}
        onClick={() => !option.disabled && onSelect(option)}
        whileHover={!option.disabled ? { y: -1 } : {}}
        whileTap={!option.disabled ? { scale: 0.985 } : {}}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative flex gap-3 items-center rounded-xl border-2 p-3.5 text-left w-full",
          "transition-[border-color,box-shadow,background-color] duration-150 outline-none",
          "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1a52c8]/40",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          selected
            ? "border-[#1a52c8] shadow-[0_0_0_4px_rgba(26,82,200,0.09)]"
            : "border-[#dbe7fb] bg-white hover:border-[#9fb6d9] hover:bg-[#f4f8ff]",
        )}
        style={
          selected
            ? {
                backgroundColor: accentAlpha,
                borderColor: accent,
                boxShadow: `0 0 0 4px ${accent}18`,
              }
            : undefined
        }
      >
        {/* Top row: icon + check */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md transition-all",
            )}
            style={
              selected
                ? { backgroundColor: accent, color: "#fff" }
                : {
                    backgroundColor: `${accent}18`,
                    color: accent,
                  }
            }
            aria-hidden="true"
          >
            {option.icon && (
              <Icon
                name={option.icon}
                className="size-4
            "
              ></Icon>
            )}
          </div>
        </div>

        {/* Label + optional desc */}
        <div className="min-w-0 flex gap-1.5 items-center justify-center">
          <p
            className={cn(
              "truncate text-xs font-bold tracking-wide leading-tight",
              selected ? "text-[#0a2d87]" : "text-[#0f172a]",
            )}
          >
            {option.label}
          </p>
          {hasDesc && !showDesc && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className={cn(
                    "flex size-4 items-center justify-start rounded-md p-0",
                    "text-[#7a90b8] hover:text-[#1a52c8] hover:bg-[#1a52c8]/8",
                    "transition-colors duration-100 cursor-help",
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="size-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                {option.shortDesc}
              </TooltipContent>
            </Tooltip>
          )}
          {/* {hasDesc && (
            <p className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-relaxed text-[#7a90b8]">
              {option.shortDesc}
            </p>
          )} */}
        </div>
        {selected && (
          <div className="absolute top-5 right-4 size-4 flex items-center justify-center rounded-full bg-current/10">
            <Check className="size-2.5 text-current" strokeWidth={3} />
          </div>
        )}
      </motion.button>
    </TooltipProvider>
  );
}

function CardsView({
  options,
  selectedIds,
  multi,
  onSelect,
  showDesc,
  colCount,
}: {
  options: SelectOption[];
  selectedIds: Set<string>;
  multi?: boolean;
  onSelect: (opt: SelectOption) => void;
  showDesc?: boolean;
  colCount: number;
}) {
  const colClass: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={cn("grid gap-2", colClass[colCount] ?? "grid-cols-3")}>
      {options.map((opt, i) => (
        <motion.div
          key={opt.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.03,
            duration: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <CardOption
            option={opt}
            selected={selectedIds.has(opt.id)}
            multi={multi}
            onSelect={onSelect}
            showDesc={showDesc}
            colCount={colCount}
          />
        </motion.div>
      ))}
    </div>
  );
}

function OptionItem({
  option,
  selected,
  multi,
  onSelect,
}: {
  option: SelectOption;
  selected: boolean;
  multi?: boolean;
  onSelect: (opt: SelectOption) => void;
}) {
  return (
    <TooltipProvider delayDuration={400}>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled}
        disabled={option.disabled}
        onClick={() => !option.disabled && onSelect(option)}
        className={cn(
          "group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left",
          "transition-colors duration-100 outline-none",
          "focus-visible:ring-2 focus-visible:ring-[#1a52c8]/30 focus-visible:ring-inset",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          selected && !multi
            ? "bg-[#1a52c8]/8 text-[#1a52c8]"
            : "hover:bg-[#f4f8ff] text-[#0f172a]",
        )}
      >
        {/* Multi checkbox */}
        {multi && (
          <span
            className={cn(
              "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2",
              "transition-all duration-150",
              selected
                ? "bg-[#1a52c8] border-[#1a52c8]"
                : "border-[#9fb6d9] bg-white group-hover:border-[#1a52c8]/50",
            )}
            aria-hidden="true"
          >
            <AnimatePresence>
              {selected && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                >
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        )}

        {/* Color dot */}
        {/* {option.color && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: option.color }}
            aria-hidden="true"
          />
        )} */}

        {/* Icon */}
        {option.icon && (
          <Icon
            name={option.icon}
            className={cn(
              "flex h-5 w-5 ",
              selected && !multi ? "text-[#1a52c8]" : "text-[#7a90b8]",
              "transition-colors duration-100",
            )}
          ></Icon>
        )}

        {/* Label */}
        <span className="flex flex-1 min-w-0 items-center justify-between gap-2">
          <span
            className={cn(
              "block truncate text-sm font-semibold",
              selected && !multi ? "text-[#1a52c8]" : "text-[#0f172a]",
            )}
          >
            {option.label}
          </span>

          {option.shortDesc && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                    "text-[#7a90b8] hover:text-[#1a52c8] hover:bg-[#1a52c8]/8",
                    "transition-colors duration-100 cursor-help",
                  )}
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[220px]">
                {option.shortDesc}
              </TooltipContent>
            </Tooltip>
          )}
        </span>

        {/* Single check */}
        {selected && !multi && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="shrink-0 text-[#1a52c8]"
            aria-hidden="true"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </motion.span>
        )}
      </button>
    </TooltipProvider>
  );
}

// ─── DropdownShell ────────────────────────────────────────────────────────────
function DropdownShell({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.985 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "absolute left-0 top-full z-50 mt-1.5 w-full min-w-[220px]",
            className,
          )}
        >
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-[#dbe7fb]",
              "bg-white shadow-[0_8px_32px_rgba(10,45,135,0.13),0_2px_8px_rgba(10,45,135,0.07)]",
            )}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// ─── GroupedOptions ───────────────────────────────────────────────────────────
function GroupedOptions({
  options,
  selectedIds,
  multi,
  onSelect,
}: {
  options: SelectOption[];
  selectedIds: Set<string>;
  multi?: boolean;
  onSelect: (opt: SelectOption) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string | undefined, SelectOption[]>();
    for (const opt of options) {
      const g = opt.group;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(opt);
    }
    return map;
  }, [options]);

  const ungrouped = groups.get(undefined) ?? [];
  const grouped = Array.from(groups.entries()).filter(([g]) => g !== undefined);

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-[#7a90b8]">
        <Search className="h-5 w-5 opacity-40" />
        <p className="text-xs font-medium">No options found</p>
      </div>
    );
  }

  return (
    <>
      {ungrouped.map((opt) => (
        <OptionItem
          key={opt.id}
          option={opt}
          selected={selectedIds.has(opt.id)}
          multi={multi}
          onSelect={onSelect}
        />
      ))}
      {grouped.map(([group, opts]) => (
        <div key={group as string} className="mt-1 first:mt-0">
          <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#7a90b8]">
            {group}
          </p>
          {opts.map((opt) => (
            <OptionItem
              key={opt.id}
              option={opt}
              selected={selectedIds.has(opt.id)}
              multi={multi}
              onSelect={onSelect}
            />
          ))}
        </div>
      ))}
    </>
  );
}

export function SelectInput(props: SelectProps) {
  const {
    options,
    placeholder,
    error,
    disabled,
    loading,
    variant = "auto",
    cardColumns = "auto",
    showCardDesc,
    searchable = true,
    clearable = true,
    maxSelected,
    showBulkActions = true,
    className,
    id,
  } = props;

  const resolvedVariant = resolveVariant(variant, options.length);
  const colCount = resolveColumns(cardColumns, options.length);

  // ── Shared state ──────────────────────────────────────────────────────────

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const listboxId = `${uid}-listbox`;

  const isMulti = props.multi === true;

  const valueAsArray: string[] = isMulti
    ? ((props as SelectMultiProps).value ?? [])
    : (props as SelectSingleProps).value
      ? [(props as SelectSingleProps).value as string]
      : [];

  const selectedIds = useMemo(() => new Set(valueAsArray), [valueAsArray]);

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedIds.has(o.id)),
    [options, selectedIds],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.shortDesc?.toLowerCase().includes(q) ||
        o.group?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const atMax = maxSelected !== undefined && valueAsArray.length >= maxSelected;

  // ── Outside click / escape ────────────────────────────────────────────────

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => searchRef.current?.focus(), 60);
    }
  }, [open]);

  // ── Select logic ──────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (opt: SelectOption) => {
      if (isMulti) {
        const mp = props as SelectMultiProps;
        const cur = mp.value ?? [];
        let next: string[];
        if (selectedIds.has(opt.id)) {
          next = cur.filter((id) => id !== opt.id);
        } else {
          if (atMax) return;
          next = [...cur, opt.id];
        }
        mp.onChange?.(
          next,
          options.filter((o) => next.includes(o.id)),
        );
        // Don't close for multi
      } else {
        const sp = props as SelectSingleProps;
        sp.onChange?.(opt.id, opt);
        setOpen(false);
      }
    },
    [isMulti, props, selectedIds, atMax, options],
  );

  const handleClear = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isMulti) {
        (props as SelectMultiProps).onChange?.([], []);
      } else {
        (props as SelectSingleProps).onChange?.(null, null);
      }
    },
    [isMulti, props],
  );

  const removeTag = useCallback(
    (id: string) => {
      if (!isMulti) return;
      const mp = props as SelectMultiProps;
      const next = (mp.value ?? []).filter((v) => v !== id);
      mp.onChange?.(
        next,
        options.filter((o) => next.includes(o.id)),
      );
    },
    [isMulti, props, options],
  );

  const selectAll = () => {
    if (!isMulti) return;
    const mp = props as SelectMultiProps;
    const cur = mp.value ?? [];
    const availIds = filtered
      .filter((o) => !o.disabled)
      .map((o) => o.id)
      .slice(0, maxSelected);
    const next = Array.from(new Set([...cur, ...availIds]));
    mp.onChange?.(
      next,
      options.filter((o) => next.includes(o.id)),
    );
  };

  const clearAll = () => handleClear();

  const allVisibleSelected =
    filtered.filter((o) => !o.disabled).length > 0 &&
    filtered.filter((o) => !o.disabled).every((o) => selectedIds.has(o.id));

  // ─────────────────────────────────────────────────────────────────────────
  // CARD VARIANT RENDER
  // ─────────────────────────────────────────────────────────────────────────

  if (resolvedVariant === "cards") {
    return (
      <MotionConfig reducedMotion="user">
        <CardsView
          options={options}
          selectedIds={selectedIds}
          multi={isMulti}
          onSelect={handleSelect}
          showDesc={showCardDesc}
          colCount={colCount}
        />
      </MotionConfig>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DROPDOWN VARIANT RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const hasValue = isMulti ? valueAsArray.length > 0 : !!valueAsArray[0];

  return (
    <MotionConfig reducedMotion="user">
      <div ref={containerRef} className={cn("relative", className)}>
        {/* ── Trigger button ─────────────────────────────────────────── */}
        <button
          id={id}
          type="button"
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-invalid={error ? true : undefined}
          aria-multiselectable={isMulti ? true : undefined}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "w-full flex items-center gap-2 rounded-xl border-2 bg-white text-left",
            "transition-[border-color,box-shadow] duration-150 outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isMulti ? "min-h-[50px] px-3 py-2" : "h-[50px] px-4",
            error
              ? open
                ? "border-red-400 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                : "border-red-300 hover:border-red-400"
              : open
                ? "border-[#1a52c8] shadow-[0_0_0_4px_rgba(26,82,200,0.10)]"
                : "border-[#dbe7fb] hover:border-[#9fb6d9]",
          )}
        >
          {/* Content area */}
          {isMulti ? (
            <div className="flex flex-1 min-w-0 flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {selectedOptions.length === 0 ? (
                  <motion.span
                    key="placeholder"
                    initial={false}
                    className="py-0.5 text-sm font-normal text-[#7a90b8]"
                  >
                    {placeholder ?? "Select options…"}
                  </motion.span>
                ) : (
                  selectedOptions.map((opt) => (
                    <SelectTag
                      key={opt.id}
                      option={opt}
                      onRemove={removeTag}
                      disabled={disabled}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          ) : (
            <span className="flex flex-1 min-w-0 items-center gap-2.5">
              {selectedOptions[0] ? (
                <>
                  {selectedOptions[0].icon && (
                    <Icon
                      className="h-4 w-4 shrink-0  text-[#1a52c8]"
                      name={selectedOptions[0].icon}
                    ></Icon>
                  )}
                  <span className="truncate text-sm font-semibold text-[#0f172a]">
                    {selectedOptions[0].label}
                  </span>
                </>
              ) : (
                <span className="text-sm font-normal text-[#7a90b8]">
                  {placeholder ?? "Select an option…"}
                </span>
              )}
            </span>
          )}

          {/* Right actions */}
          <span className="flex shrink-0 items-center gap-1.5 ml-auto self-start mt-[13px]">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-[#7a90b8]" />
            )}
            {clearable && hasValue && !loading && !disabled && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClear();
                  }
                }}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-[#7a90b8] hover:bg-red-50 hover:text-red-400 transition-colors duration-100"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            {maxSelected && (
              <span className="rounded-md bg-[#e8f0fe] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#1a52c8]">
                {valueAsArray.length}/{maxSelected}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[#7a90b8] transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </span>
        </button>

        {/* ── Dropdown ──────────────────────────────────────────────── */}
        <DropdownShell open={open}>
          {/* Search + bulk actions */}
          <div className="flex items-center gap-2.5 border-b border-[#dbe7fb] bg-[#f4f8ff] px-3 py-2.5">
            {searchable && (
              <>
                <Search className="h-4 w-4 shrink-0 text-[#7a90b8]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  aria-label="Search options"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#7a90b8]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="shrink-0 text-[#7a90b8] hover:text-[#3a5080]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
            {!searchable && <span className="flex-1" />}
            {isMulti && showBulkActions && (
              <button
                type="button"
                onClick={allVisibleSelected ? clearAll : selectAll}
                disabled={atMax && !allVisibleSelected}
                className={cn(
                  "shrink-0 rounded-lg border px-2 py-1 text-[11px] font-bold",
                  "transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40",
                  allVisibleSelected
                    ? "border-[#dbe7fb] text-red-500 hover:bg-red-50"
                    : "border-[#1a52c8]/20 text-[#1a52c8] hover:bg-[#1a52c8]/8",
                )}
              >
                {allVisibleSelected ? "Clear all" : "Select all"}
              </button>
            )}
          </div>

          {/* Max reached banner */}
          <AnimatePresence>
            {atMax && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <p className="text-[11px] font-semibold text-amber-700">
                    Max {maxSelected} selection{maxSelected !== 1 ? "s" : ""}{" "}
                    reached
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options list */}
          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable={isMulti ? true : undefined}
            className="max-h-64 overflow-y-auto overscroll-contain p-1.5"
          >
            <GroupedOptions
              options={filtered}
              selectedIds={selectedIds}
              multi={isMulti}
              onSelect={handleSelect}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-[#dbe7fb] px-3 py-1.5">
            <p className="text-[10px] font-medium text-[#7a90b8]">
              {isMulti
                ? `${valueAsArray.length} selected · ${filtered.length} option${filtered.length !== 1 ? "s" : ""}`
                : `${filtered.length} option${filtered.length !== 1 ? "s" : ""}`}
              {query && ` for "${query}"`}
            </p>
            {isMulti && valueAsArray.length > 0 && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[11px] font-bold text-[#1a52c8] hover:underline"
              >
                Done
              </button>
            )}
          </div>
        </DropdownShell>
      </div>
    </MotionConfig>
  );
}

function SelectTag({
  option,
  onRemove,
  disabled,
}: {
  option: SelectOption;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  const accent = option.color ?? "#1a52c8";

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-lg pl-2.5 text-xs font-bold",
        "border select-none shrink-0 transition-colors duration-150",
      )}
      style={
        option.color
          ? {
              backgroundColor: `${accent}18`,
              borderColor: `${accent}30`,
              color: accent,
            }
          : {
              backgroundColor: "rgba(26,82,200,0.08)",
              borderColor: "rgba(26,82,200,0.15)",
              color: "#1a52c8",
            }
      }
    >
      {option.icon && (
        <Icon name={option.icon} className="flex h-3.5 w-3.5 "></Icon>
      )}
      <span className="max-w-[120px] truncate">{option.label}</span>
      {!disabled && (
        <button
          type="button"
          aria-label={`Remove ${option.label}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(option.id);
          }}
          className={cn(
            "mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-md",
            "opacity-60 hover:opacity-100 transition-opacity duration-100",
          )}
        >
          <X className="h-2.5 w-2.5" strokeWidth={2.5} />
        </button>
      )}
    </motion.span>
  );
}

// ─── StyledTextarea ───────────────────────────────────────────────────────────

type InputCounterProps = {
  characters: number;
  maxLength: number;
  words?: number;
  className?: string;
};

export function InputCounterFooter({
  characters,
  maxLength,
  words,
  className,
}: InputCounterProps) {
  const pct = maxLength ? characters / maxLength : 0;

  const nearLimit = pct > 0.8;
  const atLimit = pct >= 1;

  const arcColor = atLimit ? "#ef4444" : nearLimit ? "#f59e0b" : "#1a52c8";

  const r = 8;
  const circ = 2 * Math.PI * r;

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border px-3 py-2",
        className,
      )}
    >
      {/* Left */}
      <div className="text-[11px] text-muted-foreground font-medium">
        {typeof words === "number" ? `${words} kata` : "\u00A0"}
      </div>

      {/* Right */}
      <div
        className="flex items-center gap-1.5 pointer-events-none"
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 20 20">
          <circle
            cx="10"
            cy="10"
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2.5"
          />

          <circle
            cx="10"
            cy="10"
            r={r}
            fill="none"
            stroke={arcColor}
            strokeWidth="2.5"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round"
            transform="rotate(-90 10 10)"
            style={{
              transition: "stroke-dashoffset 0.2s, stroke 0.2s",
            }}
          />
        </svg>

        <span
          className={cn(
            "text-[10px] font-bold tabular-nums transition-colors",
            atLimit
              ? "text-red-500"
              : nearLimit
                ? "text-amber-500"
                : "text-slate-400",
          )}
        >
          {characters}/{maxLength}
        </span>
      </div>
    </div>
  );
}

export const StyledTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(function StyledTextarea(
  { error, maxLength, className, onChange, value, defaultValue, ...props },
  ref,
) {
  const [count, setCount] = useState(
    String(value ?? defaultValue ?? "").length,
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
    onChange?.(e);
  };

  const pct = maxLength ? count / maxLength : 0;
  const nearLimit = pct > 0.8;
  const atLimit = pct >= 1;
  const arcColor = atLimit ? "#ef4444" : nearLimit ? "#f59e0b" : "#1a52c8";
  const r = 8;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative">
      <textarea
        ref={ref}
        {...props}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        className={cn(
          tokens.inputBase,
          "h-auto py-3 resize-none leading-relaxed",
          maxLength && "pb-3",
          error && tokens.inputError,
          className,
        )}
      />
      {maxLength && (
        <div
          className="absolute bottom-2.5 right-3 flex items-center gap-1.5 pointer-events-none"
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 20 20">
            <circle
              cx="10"
              cy="10"
              r={r}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />
            <circle
              cx="10"
              cy="10"
              r={r}
              fill="none"
              stroke={arcColor}
              strokeWidth="2.5"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round"
              transform="rotate(-90 10 10)"
              style={{ transition: "stroke-dashoffset 0.2s, stroke 0.2s" }}
            />
          </svg>
          <span
            className={cn(
              "text-[10px] font-bold tabular-nums",
              atLimit
                ? "text-red-500"
                : nearLimit
                  ? "text-amber-500"
                  : "text-slate-400",
            )}
          >
            {count}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
});

// ─── PhoneInput ───────────────────────────────────────────────────────────────
interface CountryCode {
  code: string;
  flag: string;
  label: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "+1", flag: "🇺🇸", label: "United States" },
  { code: "+1", flag: "🇨🇦", label: "Canada" },
  { code: "+44", flag: "🇬🇧", label: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
  { code: "+62", flag: "🇮🇩", label: "Indonesia" },
  { code: "+60", flag: "🇲🇾", label: "Malaysia" },
  { code: "+63", flag: "🇵🇭", label: "Philippines" },
  { code: "+65", flag: "🇸🇬", label: "Singapore" },
  { code: "+66", flag: "🇹🇭", label: "Thailand" },
  { code: "+81", flag: "🇯🇵", label: "Japan" },
  { code: "+82", flag: "🇰🇷", label: "South Korea" },
  { code: "+86", flag: "🇨🇳", label: "China" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+92", flag: "🇵🇰", label: "Pakistan" },
  { code: "+966", flag: "🇸🇦", label: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", label: "United Arab Emirates" },
  { code: "+974", flag: "🇶🇦", label: "Qatar" },
  { code: "+20", flag: "🇪🇬", label: "Egypt" },
  { code: "+49", flag: "🇩🇪", label: "Germany" },
  { code: "+33", flag: "🇫🇷", label: "France" },
  { code: "+39", flag: "🇮🇹", label: "Italy" },
  { code: "+34", flag: "🇪🇸", label: "Spain" },
  { code: "+31", flag: "🇳🇱", label: "Netherlands" },
  { code: "+7", flag: "🇷🇺", label: "Russia" },
  { code: "+55", flag: "🇧🇷", label: "Brazil" },
  { code: "+52", flag: "🇲🇽", label: "Mexico" },
  { code: "+27", flag: "🇿🇦", label: "South Africa" },
];

function formatPhoneNumber(digits: string): string {
  const d = digits.slice(0, 15);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}-${d.slice(11)}`;
}

export function PhoneInput({
  value,
  onChange,
  error,
  placeholder = "812-3456-7890",
  defaultCountry = "+62",
}: {
  value?: string;
  onChange?: (full: string) => void;
  error?: boolean;
  placeholder?: string;
  defaultCountry?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<CountryCode>(
    () =>
      COUNTRY_CODES.find((c) => c.code === defaultCountry) ?? COUNTRY_CODES[0],
  );
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase();
    return COUNTRY_CODES.filter(
      (c) => c.label.toLowerCase().includes(q) || c.code.includes(q),
    );
  }, [search]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setNumber(formatPhoneNumber(raw));
    onChange?.(`${selected.code}${raw}`);
  };

  const pickCountry = (country: CountryCode) => {
    setSelected(country);
    setOpen(false);
    onChange?.(`${country.code}${number.replace(/\D/g, "")}`);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center rounded-xl border-2 bg-white",
        "transition-[border-color,box-shadow] duration-150",
        error
          ? "border-red-300 focus-within:border-red-400 focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
          : "border-slate-200 hover:border-slate-300 focus-within:border-[#1a52c8] focus-within:shadow-[0_0_0_4px_rgba(26,82,200,0.1)]",
      )}
    >
      {/* Country selector button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code: ${selected.label} ${selected.code}`}
        className={cn(
          "flex h-[46px] items-center gap-1.5 border-r border-slate-100 px-3",
          "transition-colors duration-150 rounded-l-[10px] flex-shrink-0",
          open ? "bg-slate-50" : "hover:bg-slate-50/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1a52c8]",
        )}
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="text-sm font-semibold text-slate-700">
          {selected.code}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Country dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Select country code"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-1.5 w-[300px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70"
          >
            <div className="border-b border-slate-100 p-2.5">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                <Search
                  className="h-3.5 w-3.5 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country…"
                  aria-label="Search country"
                  className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5">
              {filteredCountries.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  No results
                </p>
              ) : (
                filteredCountries.map((c) => {
                  const isActive =
                    c.code === selected.code && c.label === selected.label;
                  return (
                    <button
                      key={`${c.code}-${c.label}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => pickCountry(c)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors duration-100",
                        isActive ? "bg-[#1a52c8]/8" : "hover:bg-slate-50",
                      )}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-semibold",
                            isActive ? "text-[#1a52c8]" : "text-slate-700",
                          )}
                        >
                          {c.label}
                        </p>
                        <p className="text-[11px] text-slate-400">{c.code}</p>
                      </div>
                      {isActive && (
                        <Check
                          className="h-3.5 w-3.5 text-[#1a52c8] flex-shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phone number input */}
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <Phone
          className="h-4 w-4 text-slate-400 flex-shrink-0"
          aria-hidden="true"
        />
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={number}
          onChange={handleNumber}
          placeholder={placeholder}
          aria-label="Phone number"
          className="h-[46px] w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-normal"
        />
      </div>
    </div>
  );
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────
export interface RadioOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
  disabled,
}: {
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  name?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              active
                ? "border-[#1a52c8] bg-[#1a52c8] text-white shadow-md shadow-[#1a52c8]/20"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#1a52c8]/40 hover:bg-blue-50/30",
            )}
          >
            <AnimatePresence mode="wait">
              {active && (
                <motion.span
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  aria-hidden="true"
                >
                  <Check className="w-3.5 h-3.5" />
                </motion.span>
              )}
            </AnimatePresence>
            {opt.icon && <Icon className="w-4 h-4" name={opt.icon}></Icon>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── SourceOfInfoInput ────────────────────────────────────────────────────────
interface InfoSource {
  value: string;
  label: string;
}

const INFO_SOURCES: InfoSource[] = [
  { value: "alumni_inggris_go", label: "Alumni Inggris Go" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "other", label: "Lain-lain" },
];

function parseSourceValue(value: string): {
  selected: string[];
  otherText: string;
} {
  if (!value) return { selected: [], otherText: "" };
  const knownLabels = INFO_SOURCES.filter((s) => s.value !== "other").map(
    (s) => s.label,
  );
  const parts = value.split(",").map((s) => s.trim());
  const matchedValues = INFO_SOURCES.filter(
    (s) =>
      s.value !== "other" &&
      parts.some((p) => p.toLowerCase() === s.label.toLowerCase()),
  ).map((s) => s.value);
  const unknownParts = parts.filter(
    (p) => !knownLabels.some((l) => l.toLowerCase() === p.toLowerCase()),
  );
  if (unknownParts.length > 0) matchedValues.push("other");
  return { selected: matchedValues, otherText: unknownParts.join(", ") };
}

export function SourceOfInfoInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(
    () => parseSourceValue(value).selected,
  );
  const [otherText, setOtherText] = useState(
    () => parseSourceValue(value).otherText,
  );

  const buildValue = useCallback((sel: string[], other: string) => {
    const parts = sel
      .filter((s) => s !== "other")
      .map((s) => INFO_SOURCES.find((i) => i.value === s)?.label ?? s);
    if (sel.includes("other") && other.trim()) parts.push(other.trim());
    return parts.join(", ");
  }, []);

  const toggle = (v: string) => {
    const next = selected.includes(v)
      ? selected.filter((s) => s !== v)
      : [...selected, v];
    setSelected(next);
    onChange(buildValue(next, otherText));
  };

  const showOther = selected.includes("other");

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Source of information"
      >
        {INFO_SOURCES.map((src) => {
          const active = selected.includes(src.value);
          return (
            <button
              key={src.value}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(src.value)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border-2",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1",
                active
                  ? "border-[#1a52c8] bg-[#1a52c8] text-white shadow-sm shadow-[#1a52c8]/15"
                  : [
                      "border-slate-200 bg-white text-slate-600",
                      "hover:border-[#1a52c8]/40 hover:bg-blue-50/30",
                      error && "border-slate-200",
                    ],
              )}
            >
              <AnimatePresence mode="wait">
                {active && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.13 }}
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3" />
                  </motion.span>
                )}
              </AnimatePresence>
              {src.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showOther && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <StyledInput
              placeholder="Sebutkan sumber lainnya…"
              value={otherText}
              onChange={(e) => {
                setOtherText(e.target.value);
                onChange(buildValue(selected, e.target.value));
              }}
              aria-label="Other source of information"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TShirtSizeInput ──────────────────────────────────────────────────────────
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
type SizeKey = (typeof SIZES)[number];

const SIZE_MEASUREMENTS: Record<SizeKey, { panjang: number; lebar: number }> = {
  XS: { panjang: 64, lebar: 46 },
  S: { panjang: 67, lebar: 49 },
  M: { panjang: 70, lebar: 52 },
  L: { panjang: 73, lebar: 55 },
  XL: { panjang: 76, lebar: 58 },
  XXL: { panjang: 79, lebar: 61 },
};

export function TShirtSizeInput({
  value,
  onChange,
  error,
  diagramImage,
}: {
  value?: string;
  onChange?: (v: string) => void;
  error?: boolean;
  diagramImage?: string;
}) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => {
          const active = value === size;
          const m = SIZE_MEASUREMENTS[size];
          return (
            <motion.button
              key={size}
              type="button"
              role="radio"
              aria-checked={active}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.12 }}
              onClick={() => onChange?.(size)}
              className={cn(
                "relative w-14 h-14 rounded-xl text-sm font-black border-2 flex flex-col items-center justify-center gap-0.5",
                "transition-[border-color,background-color,box-shadow,color] duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1",
                active
                  ? "border-[#1a52c8] bg-[#1a52c8] text-white shadow-lg shadow-[#1a52c8]/25"
                  : [
                      "border-slate-200 bg-white text-slate-600",
                      "hover:border-[#1a52c8]/50 hover:bg-blue-50/40",
                      error && "border-slate-200",
                    ],
              )}
            >
              <span className="text-base leading-none">{size}</span>
              <span
                className={cn(
                  "text-[9px] leading-none",
                  active ? "opacity-75" : "text-slate-400",
                )}
              >
                {m.lebar}cm
              </span>
            </motion.button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowGuide((s) => !s)}
          aria-expanded={showGuide}
          className={cn(
            "h-14 px-3 rounded-xl border-2 border-dashed text-xs font-semibold",
            "flex items-center gap-1.5 transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1",
            showGuide
              ? "border-[#1a52c8]/40 text-[#1a52c8] bg-blue-50/40"
              : "border-slate-200 text-slate-400 hover:border-[#1a52c8]/40 hover:text-[#1a52c8]",
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Size guide
        </button>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50/60">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-36">
                  {diagramImage ? (
                    <img
                      src={diagramImage}
                      alt="Size chart diagram"
                      className="w-full h-auto"
                    />
                  ) : (
                    <TShirtDiagramSVG highlightedSize={value} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Size Reference (cm)
                  </p>
                  <div className="space-y-0.5">
                    {SIZES.map((sz) => {
                      const m = SIZE_MEASUREMENTS[sz];
                      const isActive = sz === value;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => onChange?.(sz)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors duration-100 text-left",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1",
                            isActive
                              ? "bg-[#1a52c8] text-white"
                              : "hover:bg-slate-100 text-slate-700",
                          )}
                        >
                          <span
                            className={cn(
                              "w-8 font-black",
                              isActive ? "text-white" : "text-[#1a52c8]",
                            )}
                          >
                            {sz}
                          </span>
                          <span className="flex-1 text-[10px] opacity-80">
                            Panjang: <strong>{m.panjang}</strong> · Lebar:{" "}
                            <strong>{m.lebar}</strong>
                          </span>
                          {isActive && (
                            <Check
                              className="w-3 h-3 flex-shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TShirtDiagramSVG({ highlightedSize }: { highlightedSize?: string }) {
  return (
    <svg
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      role="img"
      aria-label="T-shirt size diagram"
    >
      <path
        d="M40 20 L15 55 L38 62 L38 155 L122 155 L122 62 L145 55 L120 20 L100 30 Q80 40 60 30 Z"
        fill="white"
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M60 30 Q80 50 100 30"
        fill="white"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Panjang arrow */}
      <line
        x1="90"
        y1="20"
        x2="90"
        y2="155"
        stroke="#1a52c8"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <polygon points="87,24 90,18 93,24" fill="#1a52c8" />
      <polygon points="87,151 90,157 93,151" fill="#1a52c8" />
      <text
        x="97"
        y="90"
        fontSize="9"
        fill="#1a52c8"
        fontWeight="700"
        transform="rotate(90 97 90)"
        textAnchor="middle"
      >
        Panjang
      </text>
      {/* Lebar arrow */}
      <line
        x1="38"
        y1="100"
        x2="122"
        y2="100"
        stroke="#64748b"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <polygon points="42,97 36,100 42,103" fill="#64748b" />
      <polygon points="118,97 124,100 118,103" fill="#64748b" />
      <text
        x="80"
        y="112"
        fontSize="9"
        fill="#64748b"
        fontWeight="700"
        textAnchor="middle"
      >
        Lebar
      </text>
      {highlightedSize && (
        <text
          x="80"
          y="78"
          fontSize="22"
          fontWeight="900"
          fill="#1a52c8"
          opacity="0.08"
          textAnchor="middle"
        >
          {highlightedSize}
        </text>
      )}
    </svg>
  );
}

// ─── ImageUploadWithRemoveBg ──────────────────────────────────────────────────
export function ImageUploadWithRemoveBg({
  label,
  onChange,
  onRemoveBg,
}: {
  label?: string;
  onChange?: (file: File) => void;
  onRemoveBg?: (file: File) => Promise<string>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [cleanPreview, setCleanPreview] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) return;
      setFile(f);
      setCleanPreview(null);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
      onChange?.(f);
    },
    [onChange],
  );

  const handleRemoveBg = async () => {
    if (!file || !onRemoveBg) return;
    setRemoving(true);
    try {
      const url = await onRemoveBg(file);
      setCleanPreview(url);
    } finally {
      setRemoving(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const displayImage = cleanPreview ?? preview;

  return (
    <div>
      {label && <FieldLabel className="mb-1.5">{label}</FieldLabel>}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        role={displayImage ? undefined : "button"}
        tabIndex={displayImage ? undefined : 0}
        aria-label={displayImage ? undefined : "Upload image"}
        onClick={() => !displayImage && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!displayImage && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "relative rounded-xl border-2 border-dashed overflow-hidden",
          "transition-[border-color,background-color] duration-150",
          displayImage
            ? "border-slate-200 bg-white cursor-default"
            : [
                "cursor-pointer",
                isDragging
                  ? "border-[#1a52c8]/60 bg-blue-50/50"
                  : "border-slate-200 bg-slate-50/60 hover:border-[#1a52c8]/40 hover:bg-blue-50/20",
              ],
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1",
        )}
      >
        {displayImage ? (
          <div className="relative">
            <div
              className="w-full h-48 flex items-center justify-center"
              style={
                cleanPreview
                  ? {
                      backgroundImage:
                        "linear-gradient(45deg,#e2e8f0 25%,transparent 25%),linear-gradient(-45deg,#e2e8f0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2e8f0 75%),linear-gradient(-45deg,transparent 75%,#e2e8f0 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
                    }
                  : undefined
              }
            >
              <img
                src={displayImage}
                alt="Preview"
                className="max-h-44 max-w-full object-contain"
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-1.5">
              {onRemoveBg && !cleanPreview && (
                <button
                  type="button"
                  onClick={handleRemoveBg}
                  disabled={removing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-sm text-[11px] font-bold text-[#1a52c8] hover:bg-[#1a52c8] hover:text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {removing ? (
                    <span
                      className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {removing ? "Processing…" : "Remove BG"}
                </button>
              )}
              {cleanPreview && (
                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-sm">
                  <Check className="w-3 h-3" aria-hidden="true" />
                  BG Removed
                </span>
              )}
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => {
                  setPreview(null);
                  setCleanPreview(null);
                  setFile(null);
                }}
                className="w-7 h-7 rounded-lg bg-white/95 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-slate-200 transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 border border-slate-200 text-[10px] font-semibold text-slate-500 hover:text-[#1a52c8] hover:border-[#1a52c8]/30 transition-colors duration-150"
            >
              <Upload className="w-3 h-3" aria-hidden="true" />
              Change
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.15 }}
              className="w-12 h-12 rounded-xl bg-[#1a52c8]/8 flex items-center justify-center mb-3"
            >
              <Upload className="w-5 h-5 text-[#1a52c8]" aria-hidden="true" />
            </motion.div>
            <p className="text-sm font-bold text-slate-600 mb-1">
              {isDragging
                ? "Drop to upload"
                : "Drop an image or click to browse"}
            </p>
            <p className="text-[11px] text-slate-400">
              JPG, PNG, WEBP · up to 5 MB
            </p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

// ─── FormSection ──────────────────────────────────────────────────────────────
export function FormSection({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3" aria-hidden="false">
        <div
          className="w-7 h-7 rounded-lg bg-[#1a52c8]/10 flex items-center justify-center text-[#1a52c8] flex-shrink-0"
          aria-hidden="true"
        >
          <Icon name={icon} className="size-3.5"></Icon>
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#1a52c8]">
          {title}
        </span>
        <div
          className="h-px flex-1 bg-gradient-to-r from-[#1a52c8]/20 to-transparent"
          aria-hidden="true"
        />
      </div>
      {children}
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
type PillColor = "blue" | "slate" | "amber" | "emerald" | "red" | "violet";

const pillStyles: Record<PillColor, string> = {
  blue: "bg-blue-50 text-[#1a52c8]",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-600 border border-red-100",

  violet: "bg-violet-50 text-violet-700",
};

export function Pill({
  children,
  color = "slate",
}: {
  children: React.ReactNode;
  color?: PillColor;
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full capitalize",
        pillStyles[color],
      )}
    >
      {children}
    </span>
  );
}

// Lazy singleton cache — avoids re-importing on every render.
let iconModuleCache: Record<string, React.ComponentType<LucideProps>> | null =
  null;

async function getIconModule() {
  if (iconModuleCache) return iconModuleCache;
  // Dynamic import: only runs once, tree-shaken in prod if you switch to a curated map.
  const mod = await import("lucide-react");
  iconModuleCache = mod as unknown as Record<
    string,
    React.ComponentType<LucideProps>
  >;
  return iconModuleCache;
}

// ─── IconPicker ───────────────────────────────────────────────────────────────
// Architecture: icons are Tabler/Lucide names stored as strings in DB.
// We render via the Icon component above — no bundle bloat from all-icons import.
// The picker uses a curated list of common icon names for the search grid.

const ICON_CATEGORIES: Record<string, string[]> = {
  Navigation: [
    "arrow-left",
    "arrow-right",
    "arrow-up",
    "arrow-down",
    "chevron-left",
    "chevron-right",
    "chevron-up",
    "chevron-down",
    "home",
    "menu",
    "compass",
    "map",
    "navigation",
    "corner-up-left",
  ],
  Interface: [
    "settings",
    "sliders",
    "filter",
    "search",
    "x",
    "plus",
    "minus",
    "check",
    "edit",
    "edit-2",
    "trash",
    "trash-2",
    "copy",
    "download",
    "upload",
    "refresh-cw",
    "eye",
    "eye-off",
    "lock",
    "unlock",
    "bell",
    "mail",
    "info",
    "alert-circle",
    "help-circle",
    "more-horizontal",
    "more-vertical",
  ],
  Content: [
    "file",
    "file-text",
    "folder",
    "image",
    "video",
    "music",
    "book",
    "bookmark",
    "tag",
    "list",
    "layout",
    "grid",
    "table",
    "bar-chart",
    "bar-chart-2",
    "line-chart",
    "pie-chart",
    "trending-up",
    "trending-down",
  ],
  People: [
    "user",
    "users",
    "user-plus",
    "user-check",
    "user-x",
    "heart",
    "star",
    "thumbs-up",
    "message-circle",
    "message-square",
    "phone",
    "phone-call",
    "video",
  ],
  Commerce: [
    "shopping-cart",
    "shopping-bag",
    "gift",
    "dollar-sign",
    "credit-card",
    "truck",
    "package",
    "receipt",
    "store",
    "tag",
  ],
  Tech: [
    "code",
    "code-2",
    "terminal",
    "database",
    "server",
    "cloud",
    "wifi",
    "cpu",
    "monitor",
    "smartphone",
    "tablet",
    "zap",
    "layers",
    "box",
    "globe",
    "link",
    "link-2",
  ],
};

const ALL_ICON_NAMES = Array.from(
  new Set(Object.values(ICON_CATEGORIES).flat()),
);

const RECENTS_STORAGE_KEY = "icon-picker-recents";
const MAX_RECENTS = 8;

function getRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTS_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addRecent(name: string): string[] {
  const prev = getRecents().filter((n) => n !== name);
  const next = [name, ...prev].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function IconPicker({
  value,
  onChange,
  placeholder = "Select an icon…",
  disabled,
  searchable = true,
}: {
  value?: string;
  onChange?: (name: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [recents, setRecents] = useState<string[]>([]);
  const [copiedName, setCopiedName] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load recents on mount (client only)
  useEffect(() => {
    setRecents(getRecents());
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCategory("All");
      setTimeout(() => searchRef.current?.focus(), 60);
    }
  }, [open]);

  const filteredIcons = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      return ALL_ICON_NAMES.filter((n) => n.includes(q));
    }
    if (category === "All") return ALL_ICON_NAMES;
    return ICON_CATEGORIES[category] ?? [];
  }, [query, category]);

  const pickIcon = (name: string) => {
    onChange?.(name);
    const updated = addRecent(name);
    setRecents(updated);
    setOpen(false);
  };

  const clearIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const copyName = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 1500);
  };

  const showRecents = !query && category === "All" && recents.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "w-full h-[50px] flex items-center gap-3 px-4 rounded-xl border-2 bg-white text-left",
          "transition-[border-color,box-shadow] duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none",
          open
            ? "border-[#1a52c8] shadow-[0_0_0_4px_rgba(26,82,200,0.1)]"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        {/* Icon preview */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150",
            value ? "bg-[#1a52c8]/10" : "bg-slate-100",
          )}
        >
          {value ? (
            <Icon name={value} className="w-4 h-4 text-[#1a52c8]" />
          ) : (
            <ImageIcon className="w-4 h-4 text-slate-400" aria-hidden="true" />
          )}
        </div>

        <span
          className={cn(
            "flex-1 text-sm",
            value ? "text-slate-800 font-semibold" : "text-slate-400",
          )}
        >
          {value ?? placeholder}
        </span>

        <div className="flex items-center gap-1.5">
          {value && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear icon"
              onClick={clearIcon}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  clearIcon(e as any);
                }
              }}
              className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-400 transition-colors duration-150 cursor-pointer"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Icon picker"
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[320px] rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 overflow-hidden"
          >
            {/* Search */}
            {searchable && (
              <div className="border-b border-slate-100 bg-slate-50 px-3 py-2.5 flex items-center gap-2.5">
                <Search
                  className="w-4 h-4 text-slate-400 flex-shrink-0"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCategory("All");
                  }}
                  placeholder="Search icons…"
                  aria-label="Search icons"
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="text-slate-400 border-slate-200 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Category tabs */}
            {!query && (
              <div className="flex gap-1 p-2 border-b border-slate-100 overflow-x-auto scrollbar-hide">
                {["All", ...Object.keys(ICON_CATEGORIES)].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors duration-100",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1",
                      category === cat
                        ? "bg-[#1a52c8]/10 text-[#1a52c8]"
                        : "text-slate-500 hover:bg-slate-100",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Icon grid */}
            <div className="max-h-56 overflow-y-auto p-2">
              {showRecents && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                    Recent
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1 mb-3">
                    {recents.map((name) => (
                      <IconGridCell
                        key={name}
                        name={name}
                        selected={name === value}
                        onSelect={pickIcon}
                      />
                    ))}
                  </div>
                  <div className="h-px bg-slate-100 mb-2" />
                </>
              )}

              {filteredIcons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                  <Search className="w-7 h-7 opacity-40" aria-hidden="true" />
                  <p className="text-sm">No icons for "{query}"</p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1"
                  role="listbox"
                >
                  {filteredIcons.map((name) => (
                    <IconGridCell
                      key={name}
                      name={name}
                      selected={name === value}
                      onSelect={pickIcon}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {value ? (
                  <>
                    <Icon
                      name={value}
                      className="w-4 h-4 text-[#1a52c8] flex-shrink-0"
                    />
                    <code className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono truncate">
                      {value}
                    </code>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    No icon selected
                  </span>
                )}
              </div>
              {value && (
                <button
                  type="button"
                  onClick={copyName}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-[#1a52c8] transition-colors duration-150 flex-shrink-0"
                >
                  {copiedName ? (
                    <>
                      <Check
                        className="w-3 h-3 text-emerald-500"
                        aria-hidden="true"
                      />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>Copy name</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const IconGridCell = memo(function IconGridCell({
  name,
  selected,
  onSelect,
}: {
  name: string;
  selected: boolean;
  onSelect: (name: string) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={name}
      title={name}
      onClick={() => onSelect(name)}
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center border-[1.5px] transition-all duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a52c8] focus-visible:ring-offset-1",
        selected
          ? "bg-[#1a52c8] border-[#1a52c8] text-white shadow-md shadow-[#1a52c8]/25"
          : "border-transparent text-slate-500 hover:bg-blue-50/60 hover:border-[#1a52c8]/20 hover:text-[#1a52c8]",
      )}
    >
      <Icon name={name} className="w-4 h-4" />
    </button>
  );
});
