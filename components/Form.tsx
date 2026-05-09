"use client";

/**
 * ─── Reusable Form Components ────────────────────────────────────────────────
 * Drop-in primitives for any form in the app.
 * All inputs are accessible, validated, and production-ready.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Base Styles ──────────────────────────────────────────────────────────────
export const baseInput = [
  "w-full py-3 px-4 rounded-xl border-2 border-slate-200 bg-white",
  "text-slate-800 text-sm placeholder:text-slate-400",
  "transition-all duration-200 outline-none",
  "hover:border-slate-300",
  "focus:border-[#1a52c8] focus:shadow-[0_0_0_4px_rgba(26,82,200,0.08)]",
].join(" ");

export const errorInput =
  "border-red-300 bg-red-50/30 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]";

// ─── FieldLabel ───────────────────────────────────────────────────────────────
export function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-wider"
    >
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// ─── FieldError ───────────────────────────────────────────────────────────────
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5 font-semibold"
    >
      <span className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <span className="text-[8px] font-black text-red-500">!</span>
      </span>
      {message}
    </motion.p>
  );
}

// ─── StyledInput — blocks non-numeric chars on type="number" ─────────────────
export function StyledInput({
  icon,
  error,
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  error?: boolean;
}) {
  // Prevent alphabet input on number fields
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "number") {
      // allow: digits, backspace, delete, arrows, tab, enter, minus (if min allows), decimal
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
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10 w-4 h-4">
          {icon}
        </div>
      )}
      <input
        {...props}
        // Use text type internally so browser doesn't show spinners, but validate ourselves
        type={type === "number" ? "text" : type}
        inputMode={type === "number" ? "numeric" : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          baseInput,
          icon && "pl-10",
          error && errorInput,
          className,
        )}
      />
    </div>
  );
}

// ─── PasswordInput ────────────────────────────────────────────────────────────
export function PasswordInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={cn(baseInput, "pr-11", error && errorInput)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

const COUNTRY_CODES = [
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

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 15);

  // Example:
  // 85975063224
  // => 859-7506-3224

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length <= 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(
    3,
    7,
  )}-${digits.slice(7, 11)}-${digits.slice(11)}`;
}

export function PhoneInput({
  value,
  onChange,
  error,
  placeholder = "859-7506-3224",
}: {
  value?: string;
  onChange?: (full: string) => void;
  error?: boolean;
  placeholder?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [countryCode, setCountryCode] = useState("+62");
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected =
    COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase();

    return COUNTRY_CODES.filter(
      (c) => c.label.toLowerCase().includes(q) || c.code.includes(q),
    );
  }, [search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatPhoneNumber(raw);

    setNumber(formatted);

    onChange?.(`${countryCode}${raw}`);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center rounded-2xl border bg-white transition-all duration-200",
        error
          ? "border-red-300 ring-4 ring-red-100"
          : "border-slate-200 hover:border-slate-300 focus-within:border-[#1a52c8] focus-within:ring-4 focus-within:ring-[#1a52c8]/10",
      )}
    >
      {/* Country Selector */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-[54px] items-center gap-2 border-r border-slate-100 px-3 transition-colors",
            open && "bg-slate-50",
          )}
        >
          <span className="text-lg leading-none">{selected.flag}</span>

          <span className="text-sm font-semibold text-slate-700">
            {selected.code}
          </span>

          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                y: -6,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -6,
                scale: 0.98,
              }}
              transition={{ duration: 0.16 }}
              className="absolute left-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60"
            >
              {/* Search */}
              <div className="border-b border-slate-100 p-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Search className="h-4 w-4 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..."
                    className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-72 overflow-y-auto p-1.5">
                {filteredCountries.map((c) => {
                  const active =
                    c.code === countryCode && c.label === selected.label;

                  return (
                    <button
                      key={`${c.code}-${c.label}`}
                      type="button"
                      onClick={() => {
                        setCountryCode(c.code);
                        setOpen(false);

                        onChange?.(`${c.code}${number.replace(/\D/g, "")}`);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        active ? "bg-[#1a52c8]/8" : "hover:bg-slate-50",
                      )}
                    >
                      <span className="text-lg">{c.flag}</span>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-semibold",
                            active ? "text-[#1a52c8]" : "text-slate-700",
                          )}
                        >
                          {c.label}
                        </p>

                        <p className="text-xs text-slate-400">{c.code}</p>
                      </div>

                      {active && <Check className="h-4 w-4 text-[#1a52c8]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <Phone className="h-4 w-4 text-slate-400" />

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={number}
          onChange={handleNumber}
          placeholder={placeholder}
          className="h-[54px] w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

// ─── StyledSelect ─────────────────────────────────────────────────────────────
export function StyledSelect({
  error,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          baseInput,
          "appearance-none cursor-pointer pr-10",
          error && errorInput,
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ─── Textarea with char counter ───────────────────────────────────────────────
export function StyledTextarea({
  error,
  maxLength,
  className,
  onChange,
  value,
  defaultValue,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
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

  return (
    <div className="relative">
      <textarea
        {...props}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleChange}
        className={cn(
          baseInput,
          "resize-none leading-relaxed",
          maxLength && "pb-7",
          error && errorInput,
          className,
        )}
      />
      {maxLength && (
        <div className="absolute bottom-2.5 right-3 flex items-center gap-2 pointer-events-none">
          {/* mini arc progress */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            className="flex-shrink-0"
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke={atLimit ? "#ef4444" : nearLimit ? "#f59e0b" : "#1a52c8"}
              strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 8}`}
              strokeDashoffset={`${2 * Math.PI * 8 * (1 - pct)}`}
              strokeLinecap="round"
              transform="rotate(-90 10 10)"
              className="transition-all duration-200"
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
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────
export function RadioGroup({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 flex items-center gap-2",
              value === opt.value
                ? "border-[#1a52c8] bg-[#1a52c8] text-white shadow-md shadow-[#1a52c8]/20"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#1a52c8]/40 hover:bg-slate-50",
            )}
          >
            {value === opt.value && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check className="w-3.5 h-3.5" />
              </motion.span>
            )}
            {opt.icon && <span className="w-4 h-4">{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SourceOfInfo — multi-select chips + optional free text ──────────────────
const INFO_SOURCES = [
  { value: "alumni_inggris_go", label: "Alumni Inggris Go" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "other", label: "Lain-lain" },
];

export function SourceOfInfoInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  // value is the final string; we parse it to track selection
  const [selected, setSelected] = useState<string[]>(() => {
    if (!value) return [];
    // try to match known sources
    const matched = INFO_SOURCES.filter(
      (s) =>
        s.value !== "other" &&
        value.toLowerCase().includes(s.label.toLowerCase()),
    ).map((s) => s.value);
    const hasOther = !INFO_SOURCES.filter((s) => s.value !== "other").some(
      (s) => value.toLowerCase().includes(s.label.toLowerCase()),
    );
    if (hasOther && value) matched.push("other");
    return matched;
  });
  const [otherText, setOtherText] = useState(() => {
    const knownLabels = INFO_SOURCES.filter((s) => s.value !== "other").map(
      (s) => s.label,
    );
    const parts = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => !knownLabels.includes(s));
    return parts.join(", ");
  });

  const buildValue = (sel: string[], other: string) => {
    const parts = sel
      .filter((s) => s !== "other")
      .map((s) => INFO_SOURCES.find((i) => i.value === s)?.label ?? s);
    if (sel.includes("other") && other.trim()) parts.push(other.trim());
    return parts.join(", ");
  };

  const toggle = (v: string) => {
    const next = selected.includes(v)
      ? selected.filter((s) => s !== v)
      : [...selected, v];
    setSelected(next);
    onChange(buildValue(next, otherText));
  };

  const showOther = selected.includes("other");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {INFO_SOURCES.map((src) => {
          const active = selected.includes(src.value);
          return (
            <button
              key={src.value}
              type="button"
              onClick={() => toggle(src.value)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center gap-1.5",
                active
                  ? "border-[#1a52c8] bg-[#1a52c8] text-white shadow-sm shadow-[#1a52c8]/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#1a52c8]/40 hover:bg-slate-50",
                error && !active && "border-red-200",
              )}
            >
              {active && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-3 h-3" />
                </motion.span>
              )}
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
            className="overflow-hidden"
          >
            <div className="pt-2">
              <StyledInput
                placeholder="Sebutkan sumber lainnya..."
                value={otherText}
                onChange={(e) => {
                  setOtherText(e.target.value);
                  onChange(buildValue(selected, e.target.value));
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TShirtSizeInput — visual size picker with diagram ───────────────────────
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Size measurements in cm for reference
const SIZE_MEASUREMENTS: Record<string, { panjang: number; lebar: number }> = {
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
  const [showDiagram, setShowDiagram] = useState(false);
  const measurements = value ? SIZE_MEASUREMENTS[value] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {SIZES.map((size) => {
          const active = value === size;
          return (
            <motion.button
              key={size}
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange?.(size)}
              className={cn(
                "relative w-14 h-14 rounded-2xl text-sm font-black border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0.5",
                active
                  ? "border-[#1a52c8] bg-[#1a52c8] text-white shadow-lg shadow-[#1a52c8]/25"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#1a52c8]/50 hover:bg-slate-50",
                error && !active && "border-red-200",
              )}
            >
              {/* {active && (
                <motion.div
                  layoutId="size-selected"
                  className="absolute inset-0 rounded-2xl bg-[#1a52c8]"
                  style={{ zIndex: -1 }}
                />
              )} */}
              <span className="text-base leading-none">{size}</span>
              {measurements && active && (
                <span className="text-[8px] opacity-70 leading-none">
                  {measurements.lebar}cm
                </span>
              )}
            </motion.button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowDiagram((s) => !s)}
          className="h-14 px-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-[#1a52c8]/40 hover:text-[#1a52c8] transition-colors text-xs font-semibold flex items-center gap-1.5"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Size guide
        </button>
      </div>

      <AnimatePresence>
        {showDiagram && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/60 mb-3">
              <div className="flex gap-4 items-start">
                {/* T-shirt diagram: show uploaded image or SVG fallback */}
                <div className="flex-shrink-0 w-40">
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

                {/* Measurements table */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Size Reference (cm)
                  </p>
                  <div className="space-y-1">
                    {SIZES.map((sz) => {
                      const m = SIZE_MEASUREMENTS[sz];
                      const isActive = sz === value;
                      return (
                        <div
                          key={sz}
                          onClick={() => onChange?.(sz)}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs",
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
                          <span className="flex-1 text-[10px]">
                            Panjang: <strong>{m.panjang}</strong> · Lebar:{" "}
                            <strong>{m.lebar}</strong>
                          </span>
                          {isActive && <Check className="w-3 h-3" />}
                        </div>
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

// Internal SVG fallback for t-shirt diagram
function TShirtDiagramSVG({ highlightedSize }: { highlightedSize?: string }) {
  return (
    <svg
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* T-shirt outline */}
      <path
        d="M40 20 L15 55 L38 62 L38 155 L122 155 L122 62 L145 55 L120 20 L100 30 Q80 40 60 30 Z"
        fill="white"
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Collar */}
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
        fontSize="10"
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
        fontSize="10"
        fill="#64748b"
        fontWeight="700"
        textAnchor="middle"
      >
        Lebar
      </text>
      {/* Highlight ring if size selected */}
      {highlightedSize && (
        <text
          x="80"
          y="78"
          fontSize="22"
          fontWeight="900"
          fill="#1a52c8"
          opacity="0.1"
          textAnchor="middle"
        >
          {highlightedSize}
        </text>
      )}
    </svg>
  );
}

// ─── ImageUploadWithRemoveBg ──────────────────────────────────────────────────
/**
 * Lets users upload a photo; shows a preview with a "Remove Background" button.
 * On real projects, wire removeBg to your API (e.g. remove.bg API).
 */
export function ImageUploadWithRemoveBg({
  label,
  onChange,
  onRemoveBg,
}: {
  label?: string;
  onChange?: (file: File) => void;
  /** Async callback — call remove.bg API and return the cleaned image URL */
  onRemoveBg?: (file: File) => Promise<string>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [cleanPreview, setCleanPreview] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setCleanPreview(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    onChange?.(f);
  };

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  }, []);

  const displayImage = cleanPreview ?? preview;

  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          displayImage
            ? "border-slate-200 bg-white"
            : "border-slate-200 bg-slate-50/60 hover:border-[#1a52c8]/50 hover:bg-[#1a52c8]/3 cursor-pointer",
        )}
        onClick={() => !displayImage && inputRef.current?.click()}
      >
        {displayImage ? (
          <div className="relative">
            <div
              className="w-full h-48 flex items-center justify-center"
              style={{
                backgroundImage: cleanPreview
                  ? "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)"
                  : undefined,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            >
              <img
                src={displayImage}
                alt="Preview"
                className="max-h-44 max-w-full object-contain"
              />
            </div>

            {/* Actions overlay */}
            <div className="absolute top-2 right-2 flex gap-1.5">
              {/* {onRemoveBg && !cleanPreview && (
                <button
                  type="button"
                  onClick={handleRemoveBg}
                  disabled={removing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-sm text-[11px] font-bold text-[#1a52c8] hover:bg-[#1a52c8] hover:text-white transition-all duration-200 disabled:opacity-60"
                >
                  {removing ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  {removing ? "Processing…" : "Remove BG"}
                </button>
              )}
              {cleanPreview && (
                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-sm">
                  <Check className="w-3 h-3" />
                  BG Removed
                </span>
              )} */}
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setCleanPreview(null);
                  setFile(null);
                }}
                className="w-7 h-7 rounded-lg bg-white/95 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 border border-slate-200 text-[10px] font-semibold text-slate-500 hover:text-[#1a52c8] transition-colors"
            >
              <Upload className="w-3 h-3" />
              Change
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#1a52c8]/8 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-[#1a52c8]" />
            </div>
            <p className="text-sm font-bold text-slate-600 mb-1">
              Drop an image or click to browse
            </p>
            <p className="text-[11px] text-slate-400">
              JPG, PNG, WEBP up to 5MB
            </p>
            {/* {onRemoveBg && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <ImageIcon className="w-3.5 h-3.5" />
                Background removal supported
              </div>
            )} */}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
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
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#1a52c8]/10 flex items-center justify-center text-[#1a52c8] flex-shrink-0">
          {icon}
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#1a52c8]">
          {title}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-[#1a52c8]/20 to-transparent" />
      </div>
      {children}
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
export function Pill({
  children,
  color = "slate",
}: {
  children: React.ReactNode;
  color?: "blue" | "slate" | "amber" | "emerald" | "red";
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full capitalize",
        {
          blue: "bg-blue-50 text-[#1a52c8]",
          slate: "bg-slate-100 text-slate-600",
          amber: "bg-amber-50 text-amber-700",
          emerald: "bg-emerald-50 text-emerald-700",
          red: "bg-red-50 text-red-600 border border-red-100",
        }[color],
      )}
    >
      {children}
    </span>
  );
}
