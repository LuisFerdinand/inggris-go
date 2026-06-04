// app/(dashboard)/dashboard/programs/_modules/ui/components/ProgramFilters.tsx
"use client";

import { useProgramFilters } from "../../hooks/use-program-filters";
import { cn } from "@/lib/utils";
import { X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Filter option types ──────────────────────────────────────────────────────

type FilterOption = { value: string; label: string };

const STATUS_OPTIONS: FilterOption[] = [
  { value: "published", label: "Terbit" },
  { value: "draft", label: "Draf" },
  { value: "scheduled", label: "Terjadwal" },
  { value: "archived", label: "Diarsip" },
];
const FORMAT_OPTIONS: FilterOption[] = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
];
const LEVEL_OPTIONS: FilterOption[] = [
  { value: "beginner", label: "Pemula" },
  { value: "intermediate", label: "Menengah" },
  { value: "advanced", label: "Mahir" },
];
const SCHEDULE_OPTIONS: FilterOption[] = [
  { value: "permanent", label: "Permanen" },
  { value: "scheduled", label: "Terjadwal" },
];
const REGISTRATION_OPTIONS: FilterOption[] = [
  { value: "open", label: "Terbuka" },
  { value: "closed", label: "Tertutup" },
  { value: "invite_only", label: "Undangan" },
];

// ─── Single filter chip ───────────────────────────────────────────────────────

function FilterChip({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string | null | undefined;
  onChange: (v: string | null) => void;
}) {
  const selected = options.find((o) => o.value === value);
  const isActive = !!selected;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            // Base — fixed height, never shrinks on mobile
            "inline-flex items-center gap-1 h-7 rounded-full border px-2.5 text-[11px] font-medium",
            "transition-all duration-150 outline-none whitespace-nowrap shrink-0",
            "focus-visible:ring-2 focus-visible:ring-blue-500/20",
            isActive
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700",
          )}
        >
          {isActive ? (
            <>
              <span className="text-blue-400 text-[10px] font-normal">
                {label}:
              </span>
              <span className="font-semibold">{selected.label}</span>
            </>
          ) : (
            label
          )}
          <ChevronDown
            className={cn(
              "size-3 shrink-0 transition-opacity",
              isActive ? "opacity-60" : "opacity-40",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="w-40">
        <DropdownMenuLabel className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            className={cn(
              "text-xs cursor-pointer",
              value === opt.value &&
                "font-semibold text-blue-700 bg-blue-50 focus:bg-blue-50 focus:text-blue-700",
            )}
            onClick={() => onChange(value === opt.value ? null : opt.value)}
          >
            <span className="flex-1">{opt.label}</span>
            {value === opt.value && (
              <span className="text-blue-500 text-[11px]">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ProgramFilters = () => {
  const [
    { status, format, level, scheduleType, registrationType },
    setFilters,
  ] = useProgramFilters();

  const activeCount = [
    status,
    format,
    level,
    scheduleType,
    registrationType,
  ].filter(Boolean).length;

  const clearAll = () =>
    setFilters({
      status: null,
      format: null,
      level: null,
      scheduleType: null,
      registrationType: null,
    });

  return (
    /*
     * On mobile: horizontal scroll row — chips never wrap, swipe to see more.
     * On sm+: normal flex-wrap row.
     */
    <div className="flex items-center min-w-0">
      <div
        className={cn(
          // Mobile: single scrollable row, hidden scrollbar
          "flex items-center gap-1.5 overflow-x-auto",
          "scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]",
          // Desktop: wrap naturally
          "sm:flex-wrap sm:overflow-x-visible",
        )}
      >
        <FilterChip
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setFilters({ status: v as typeof status })}
        />
        <FilterChip
          label="Format"
          options={FORMAT_OPTIONS}
          value={format}
          onChange={(v) => setFilters({ format: v as typeof format })}
        />
        <FilterChip
          label="Level"
          options={LEVEL_OPTIONS}
          value={level}
          onChange={(v) => setFilters({ level: v as typeof level })}
        />
        <FilterChip
          label="Jadwal"
          options={SCHEDULE_OPTIONS}
          value={scheduleType}
          onChange={(v) =>
            setFilters({ scheduleType: v as typeof scheduleType })
          }
        />
        <FilterChip
          label="Pendaftaran"
          options={REGISTRATION_OPTIONS}
          value={registrationType}
          onChange={(v) =>
            setFilters({ registrationType: v as typeof registrationType })
          }
        />

        {/* Clear all — only visible when something active */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className={cn(
              "inline-flex items-center gap-1 h-7 rounded-full border px-2 shrink-0",
              "text-[11px] text-neutral-500 border-neutral-200 bg-white",
              "hover:border-red-200 hover:bg-red-50 hover:text-red-600",
              "transition-all duration-150 whitespace-nowrap",
            )}
          >
            <X className="size-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgramFilters;
