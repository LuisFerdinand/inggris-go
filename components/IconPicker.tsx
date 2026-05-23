// components/Form/IconPicker.tsx
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  memo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  Check,
  Copy,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { ICON_NAMES } from "@/lib/icons"; // your full list

// ─── Category definitions ─────────────────────────────────────────────────────
// Keep categories for filtering; ALL_ICON_NAMES comes from your complete list.

const ICON_CATEGORIES: Record<string, string[]> = {
  Navigation: [
    "arrow-left","arrow-right","arrow-up","arrow-down","arrow-up-left","arrow-up-right",
    "arrow-down-left","arrow-down-right","chevron-left","chevron-right","chevron-up",
    "chevron-down","chevrons-left","chevrons-right","chevrons-up","chevrons-down",
    "home","menu","compass","map","map-pin","navigation","navigation-2","corner-up-left",
    "corner-up-right","corner-down-left","corner-down-right","move","move-diagonal",
    "move-horizontal","move-vertical","maximize","minimize","maximize-2","minimize-2",
  ],
  Interface: [
    "settings","settings-2","sliders","sliders-horizontal","filter","search","search-x",
    "x","plus","plus-circle","minus","minus-circle","check","check-circle","check-circle-2",
    "check-square","edit","edit-2","edit-3","pencil","trash","trash-2","copy","clipboard",
    "clipboard-check","clipboard-list","download","upload","refresh-cw","refresh-ccw",
    "rotate-cw","rotate-ccw","eye","eye-off","lock","lock-open","unlock","bell","bell-off",
    "bell-ring","mail","mail-open","info","info-circle","alert-circle","alert-triangle",
    "alert-octagon","help-circle","more-horizontal","more-vertical","external-link",
    "link","link-2","link-off","share","share-2","send","sidebar","panel-left","panel-right",
    "layout","layout-grid","layout-list","layout-dashboard","columns","rows",
    "toggle-left","toggle-right","zoom-in","zoom-out","scan","qr-code","fingerprint",
    "shield","shield-check","shield-off","shield-alert","key","log-in","log-out",
    "save","save-all","undo","redo","undo-2","redo-2","scissors","paperclip","pin",
    "pin-off","flag","flag-off","bookmark","bookmark-plus","bookmark-minus","bookmark-check",
  ],
  Content: [
    "file","file-text","file-code","file-code-2","file-json","file-image","file-video",
    "file-audio","file-archive","file-check","file-x","file-minus","file-plus","file-search",
    "file-edit","files","folder","folder-open","folder-plus","folder-minus","folder-x",
    "folder-check","folder-search","folder-git","folder-git-2","folder-input","folder-output",
    "image","images","camera","camera-off","video","video-off","film","clapperboard",
    "music","music-2","music-3","music-4","mic","mic-off","headphones","radio","tv","tv-2",
    "book","book-open","book-marked","book-copy","book-down","book-up","book-lock","book-check",
    "bookmark","tag","tags","list","list-ordered","list-checks","list-tree","list-todo",
    "grid","table","table-2","table-properties","rows","columns","database","archive",
    "inbox","inbox-in","message-square","message-circle","bar-chart","bar-chart-2",
    "bar-chart-3","bar-chart-4","bar-chart-horizontal","line-chart","area-chart","pie-chart",
    "donut","scatter-chart","trending-up","trending-down","activity","pulse",
    "presentation","presentation-chart","newspaper","rss","type","text","text-cursor",
    "bold","italic","underline","strikethrough","code","code-2","terminal","braces",
    "brackets","quote","hash","heading","heading-1","heading-2","heading-3",
    "align-left","align-right","align-center","align-justify","indent","outdent",
  ],
  People: [
    "user","users","user-plus","user-minus","user-check","user-x","user-circle","user-circle-2",
    "user-cog","user-square","user-square-2","contact","contact-2","person-standing",
    "baby","heart","heart-crack","heart-handshake","heart-off","heart-pulse",
    "star","star-off","star-half","thumbs-up","thumbs-down","smile","frown","meh",
    "laugh","angry","message-circle","message-square","messages-square","speech",
    "phone","phone-call","phone-off","phone-incoming","phone-outgoing","phone-missed",
    "phone-forwarded","voicemail","at-sign","mail","hand","handshake",
  ],
  Commerce: [
    "shopping-cart","shopping-bag","store","shop","package","package-2","package-check",
    "package-open","package-minus","package-plus","package-search","package-x",
    "gift","gift-2","dollar-sign","euro","pound-sterling","japanese-yen","indian-rupee",
    "bitcoin","credit-card","wallet","banknote","receipt","landmark","piggy-bank",
    "coins","gem","percent","tag","tags","truck","car","bike","plane","ship",
    "ticket","badge","badge-check","badge-alert","award","trophy","medal","crown",
  ],
  Tech: [
    "code","code-2","terminal","database","database-backup","server","cloud","cloud-off",
    "cloud-upload","cloud-download","cloud-lightning","cloud-rain","cloud-snow",
    "wifi","wifi-off","bluetooth","bluetooth-off","bluetooth-connected","bluetooth-searching",
    "cpu","memory-stick","hard-drive","hard-drive-upload","hard-drive-download",
    "monitor","monitor-off","monitor-dot","monitor-smartphone","laptop","laptop-2",
    "pc-case","keyboard","mouse","printer","webcam","projector",
    "smartphone","smartphone-charging","smartphone-nfc","tablet","tablet-smartphone",
    "watch","tv","tv-2","radio","speaker","headphones","headset","mic","mic-2",
    "zap","zap-off","bolt","battery","battery-charging","battery-full","battery-low",
    "battery-medium","power","power-off","plug","plug-2","plug-zap","usb","usb-2",
    "layers","layers-2","layers-3","box","boxes","container","combine","component",
    "globe","globe-2","globe-lock","network","router","switch","circuit-board",
    "binary","braces","brackets","function-square","variable","regex","webhook",
    "git-branch","git-branch-plus","git-commit","git-compare","git-fork","git-merge",
    "git-pull-request","github","gitlab","figma","framer","slack","chrome","firefox",
    "bug","bug-off","bug-play","shield-code","lock-keyhole","lock-keyhole-open",
  ],
  Nature: [
    "sun","sun-dim","sun-medium","sun-snow","moon","cloud","cloud-sun","cloud-moon",
    "cloud-rain","cloud-snow","cloud-lightning","wind","waves","droplets","drop",
    "flame","snowflake","leaf","flower","flower-2","tree","tree-pine","tree-deciduous",
    "sprout","seedling","cactus","palmtree","mountain","mountain-snow","rainbow",
    "star","sparkles","sparkle","zap","umbrella","anchor","fish","shell","snail",
    "bird","bug","cat","dog","rabbit","squirrel","turtle","worm","rat","paw-print",
  ],
  Misc: [
    "circle","square","triangle","diamond","octagon","hexagon","pentagon","star",
    "heart","club","spade","bomb","skull","ghost","alien","rocket","satellite",
    "telescope","microscope","stethoscope","pill","syringe","test-tube","flask","beaker",
    "atom","dna","brain","eye","ear","hand","footprints","footprint",
    "music","music-2","film","camera","image","palette","brush","pen","pencil-ruler",
    "ruler","compass","drafting-compass","scissors","spool","needle","shirt","glasses",
    "sunglasses","watch","ring","gem","crown","wand","wand-2","magic","sparkles",
    "trophy","medal","award","badge","ribbon","flag","bookmark","tag",
    "map","map-pin","globe","home","building","building-2","castle","landmark",
    "church","hotel","hospital","school","library","store","warehouse","factory",
    "construction","hammer","wrench","screwdriver","drill","shovel","axe","sword",
    "shield","target","crosshair","loader","loader-2","timer","timer-off","timer-reset",
    "alarm-clock","alarm-clock-off","alarm-clock-check","alarm-clock-minus","alarm-clock-plus",
    "clock","clock-1","clock-2","clock-3","clock-4","clock-5","clock-6","clock-7",
    "clock-8","clock-9","clock-10","clock-11","clock-12","hourglass","calendar",
    "calendar-check","calendar-check-2","calendar-clock","calendar-days","calendar-minus",
    "calendar-off","calendar-plus","calendar-range","calendar-search","calendar-x","calendar-x-2",
  ],
};

// Merge ICON_NAMES (your full list) with the categorized ones
// Icons not in any category go under "All" only
const CATEGORIZED = new Set(Object.values(ICON_CATEGORIES).flat());
const ALL_ICON_NAMES: string[] = Array.from(
  new Set([...ICON_NAMES, ...CATEGORIZED]),
).sort();

// For the "Misc" catch-all: add any from ICON_NAMES not in other categories
const uncategorized = ICON_NAMES.filter(
  (n) =>
    !Object.entries(ICON_CATEGORIES)
      .filter(([k]) => k !== "Misc")
      .some(([, v]) => v.includes(n)),
);
ICON_CATEGORIES["Misc"] = Array.from(
  new Set([...(ICON_CATEGORIES["Misc"] ?? []), ...uncategorized]),
).sort();

// ─── Storage ──────────────────────────────────────────────────────────────────

const RECENTS_KEY = "icon-picker-recents";
const MAX_RECENTS = 16;

function getRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(name: string): string[] {
  const prev = getRecents().filter((n) => n !== name);
  const next = [name, ...prev].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

// ─── Portal wrapper ───────────────────────────────────────────────────────────

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─── IconGridCell ─────────────────────────────────────────────────────────────

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
        "group relative flex flex-col items-center justify-center gap-1 rounded-lg p-1.5",
        "border-[1.5px] transition-all duration-100 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        selected
          ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/30"
          : "border-transparent text-neutral-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600",
      )}
    >
      <Icon name={name} className="w-4 h-4 shrink-0" />
      <span
        className={cn(
          "text-[9px] leading-none truncate w-full text-center font-medium",
          selected ? "text-white/90" : "text-neutral-400 group-hover:text-blue-500",
        )}
      >
        {name}
      </span>
    </button>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export function IconPicker({
  value,
  onChange,
  placeholder = "Select an icon…",
  disabled,
  searchable = true,
  popoverWidth = 360,
}: {
  value?: string;
  onChange?: (name: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  /** Width of the dropdown panel in px. Defaults to 360. */
  popoverWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [recents, setRecents] = useState<string[]>([]);
  const [copiedName, setCopiedName] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load recents (client-only)
  useEffect(() => {
    setRecents(getRecents());
  }, []);

  // Position the portal popover relative to the trigger
  const positionPopover = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const panelH = 420; // estimated max height
    const openUpward = spaceBelow < panelH && spaceAbove > spaceBelow;

    // Clamp left so panel doesn't overflow viewport
    let left = rect.left + window.scrollX;
    const right = left + popoverWidth;
    if (right > window.innerWidth - 8) {
      left = window.innerWidth - popoverWidth - 8;
    }

    setPopoverStyle({
      position: "absolute",
      width: popoverWidth,
      left,
      top: openUpward
        ? rect.top + window.scrollY - panelH - 6
        : rect.bottom + window.scrollY + 6,
      zIndex: 9999,
    });
  }, [popoverWidth]);

  // Open/close + positioning
  const openPanel = useCallback(() => {
    positionPopover();
    setOpen(true);
    setQuery("");
    setCategory("All");
    setTimeout(() => searchRef.current?.focus(), 60);
  }, [positionPopover]);

  const closePanel = useCallback(() => {
    setOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    if (open) closePanel();
    else openPanel();
  }, [open, openPanel, closePanel]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const handler = () => positionPopover();
    window.addEventListener("scroll", handler, { passive: true, capture: true });
    window.addEventListener("resize", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler, { capture: true } as any);
      window.removeEventListener("resize", handler);
    };
  }, [open, positionPopover]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      )
        return;
      closePanel();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closePanel]);

  // ── Filtered icons ──────────────────────────────────────────────────────────

  const filteredIcons = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      return ALL_ICON_NAMES.filter((n) => n.includes(q));
    }
    if (category === "All") return ALL_ICON_NAMES;
    if (category === "Recent") return recents;
    return ICON_CATEGORIES[category] ?? [];
  }, [query, category, recents]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const pickIcon = (name: string) => {
    onChange?.(name);
    const updated = saveRecent(name);
    setRecents(updated);
    closePanel();
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

  // ── Category tabs ───────────────────────────────────────────────────────────
  // "Recent" tab only shown when there are recents and no active search
  const tabs = [
    "All",
    ...(recents.length > 0 ? ["Recent"] : []),
    ...Object.keys(ICON_CATEGORIES),
  ];

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_ICON_NAMES.length };
    if (recents.length > 0) counts["Recent"] = recents.length;
    for (const [cat, icons] of Object.entries(ICON_CATEGORIES)) {
      counts[cat] = icons.length;
    }
    return counts;
  }, [recents.length]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={togglePanel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "w-full h-10 flex items-center gap-2.5 px-3 rounded-lg border bg-white text-left",
          "transition-all duration-150 outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          open
            ? "border-blue-500 ring-2 ring-blue-500/10"
            : "border-neutral-200 hover:border-neutral-300",
        )}
      >
        {/* Preview slot */}
        <div
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-150",
            value ? "bg-blue-50 text-blue-600" : "bg-neutral-100 text-neutral-400",
          )}
        >
          {value ? (
            <Icon name={value} className="w-3.5 h-3.5" />
          ) : (
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </div>

        <span
          className={cn(
            "flex-1 text-sm truncate",
            value ? "text-neutral-800 font-medium" : "text-neutral-400",
          )}
        >
          {value ?? placeholder}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0">
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
              className={cn(
                "w-4 h-4 rounded flex items-center justify-center",
                "text-neutral-300 hover:text-red-400 hover:bg-red-50",
                "transition-colors duration-150 cursor-pointer",
              )}
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-neutral-400 transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Portal panel */}
      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-label="Icon picker"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.13, ease: [0.22, 0.68, 0, 1.2] }}
              style={popoverStyle}
              className="rounded-xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 overflow-hidden flex flex-col"
            >
              {/* Search bar */}
              {searchable && (
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100 bg-neutral-50 flex-shrink-0">
                  <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" aria-hidden="true" />
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
                    className="flex-1 bg-transparent text-sm outline-none text-neutral-700 placeholder:text-neutral-400 min-w-0"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-neutral-300 font-medium flex-shrink-0 tabular-nums">
                      {ALL_ICON_NAMES.length}
                    </span>
                  )}
                </div>
              )}

              {/* Category tabs */}
              {!query && (
                <div className="flex gap-0.5 px-2 pt-1.5 pb-1 border-b border-neutral-100 overflow-x-auto scrollbar-hide flex-shrink-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setCategory(tab)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all duration-100",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
                        category === tab
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
                      )}
                    >
                      {tab}
                      {query.length === 0 && (
                        <span
                          className={cn(
                            "text-[9px] font-bold tabular-nums",
                            category === tab ? "text-white/70" : "text-neutral-400",
                          )}
                        >
                          {categoryCount[tab]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Icon grid */}
              <div className="overflow-y-auto p-2 flex-1" style={{ maxHeight: 300 }}>
                {filteredIcons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-neutral-400 gap-2">
                    <Search className="w-6 h-6 opacity-30" aria-hidden="true" />
                    <p className="text-xs">No icons match "{query}"</p>
                  </div>
                ) : (
                  <div
                    className="grid gap-0.5"
                    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))" }}
                    role="listbox"
                    aria-label="Icons"
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
              <div className="border-t border-neutral-100 px-3 py-2 flex items-center justify-between gap-3 flex-shrink-0 bg-neutral-50/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  {value ? (
                    <>
                      <div className="w-5 h-5 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <Icon name={value} className="w-3.5 h-3.5" />
                      </div>
                      <code className="text-[11px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-mono truncate">
                        {value}
                      </code>
                    </>
                  ) : (
                    <span className="text-[11px] text-neutral-400 italic">
                      No icon selected
                    </span>
                  )}
                </div>
                {value && (
                  <button
                    type="button"
                    onClick={copyName}
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-medium transition-colors duration-150 flex-shrink-0",
                      copiedName
                        ? "text-emerald-600"
                        : "text-neutral-400 hover:text-blue-600",
                    )}
                  >
                    {copiedName ? (
                      <>
                        <Check className="w-3 h-3" aria-hidden="true" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        Copy name
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}