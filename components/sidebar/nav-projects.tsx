"use client";

import Link from "next/link";
import {
  ClockIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  XIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navItemClass, SECTION_LABEL_STYLE } from "./nav-styles";

type RecentItem = {
  name: string;
  url: string;
  updatedAt?: string;
  icon?: React.ReactNode;
};

const DEFAULT_VISIBLE = 3;
const EXPAND_STEP = 5;

// ── Collapsed: clock icon → dropdown with recent list ────────
function CollapsedNavProject({ items }: { items: RecentItem[] }) {
  const preview = items.slice(0, 5);

  return (
    <SidebarGroup className="px-2 py-1">
      <SidebarMenu className="items-center">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="Terakhir Diperbarui"
                  className={`relative size-8 justify-center p-0 ${navItemClass(false)}`}
                >
                  <ClockIcon className="!size-3.5 text-[var(--text-faint)]" />
                  {/* Badge dot showing item count */}
                  {items.length > 0 && (
                    <span
                      className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--blue)" }}
                    />
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={12}
                className="w-60 rounded-xl p-0 overflow-hidden shadow-xl"
                style={{
                  border: "1px solid rgba(10,45,135,0.1)",
                  boxShadow:
                    "0 12px 40px rgba(10,45,135,0.14), 0 2px 8px rgba(10,45,135,0.06)",
                  background: "white",
                }}
              >
                {/* Popover header */}
                <div
                  className="px-3 py-2.5"
                  style={{
                    borderBottom: "1px solid rgba(10,45,135,0.07)",
                    background: "rgba(10,45,135,0.02)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ClockIcon
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--blue)" }}
                    />
                    <span
                      className="text-[0.78rem] font-semibold uppercase tracking-wide"
                      style={{
                        color: "var(--text-main)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Terakhir Diperbarui
                    </span>
                    <span
                      className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(26,82,200,0.1)",
                        color: "var(--blue)",
                      }}
                    >
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Items list */}
                <div className="p-1.5">
                  {preview.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      asChild
                      className="rounded-lg px-2.5 py-2 cursor-pointer focus:bg-[rgba(10,45,135,0.06)]"
                    >
                      <Link href={item.url}>
                        <div className="flex items-center gap-2.5 w-full">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                            style={{ background: "rgba(10,45,135,0.06)" }}
                          >
                            {item.icon ?? (
                              <BookOpenIcon
                                className="w-3 h-3"
                                style={{ color: "var(--text-faint)" }}
                              />
                            )}
                          </div>
                          <span
                            className="flex-1 truncate text-[0.8rem] font-medium"
                            style={{ color: "var(--text-main)" }}
                          >
                            {item.name}
                          </span>
                          {item.updatedAt && (
                            <span
                              className="shrink-0 text-[10px] tabular-nums"
                              style={{ color: "var(--text-faint)" }}
                            >
                              {item.updatedAt}
                            </span>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>

                {/* Footer link */}
                <div style={{ borderTop: "1px solid rgba(10,45,135,0.07)" }}>
                  <DropdownMenuItem
                    asChild
                    className="rounded-none px-3 py-2.5 cursor-pointer focus:bg-[rgba(10,45,135,0.06)]"
                  >
                    <Link
                      href="/dashboard/programs"
                      className="flex items-center justify-between w-full"
                    >
                      <span
                        className="text-[0.78rem] font-semibold"
                        style={{ color: "var(--blue)" }}
                      >
                        Lihat semua program
                      </span>
                      <ArrowRightIcon
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--blue)" }}
                      />
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

// ── Expanded view ─────────────────────────────────────────────
export function NavProject({ items }: { items: RecentItem[] }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter((i) =>
      i.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [items, query]);

  const displayed = searchOpen ? filtered : filtered.slice(0, visibleCount);
  const hasMore = !searchOpen && filtered.length > visibleCount;
  const isExpanded = searchOpen || visibleCount > DEFAULT_VISIBLE;

  function handleToggleSearch() {
    setSearchOpen((v) => {
      if (!v) setTimeout(() => searchRef.current?.focus(), 50);
      else setQuery("");
      return !v;
    });
  }

  function handleLoadMore() {
    setVisibleCount((c) => Math.min(c + EXPAND_STEP, items.length));
  }

  function handleCollapse() {
    setVisibleCount(DEFAULT_VISIBLE);
    setSearchOpen(false);
    setQuery("");
  }

  if (!items.length) return null;
  if (isCollapsed) return <CollapsedNavProject items={items} />;

  return (
    <SidebarGroup className="px-2 py-1.5">
      {/* Header */}
      <div className="flex items-center justify-between pr-1">
        <SidebarGroupLabel
          className="flex items-center gap-1.5 h-auto p-0 text-[10px] font-bold uppercase text-[var(--text-faint)]"
          style={SECTION_LABEL_STYLE}
        >
          <ClockIcon className="w-3 h-3" />
          Terakhir Diperbarui
        </SidebarGroupLabel>
        <button
          onClick={handleToggleSearch}
          className="flex items-center justify-center w-5 h-5 rounded-md transition-colors duration-150 hover:bg-[rgba(10,45,135,0.08)]"
          style={{ color: "var(--text-faint)" }}
          title={searchOpen ? "Tutup pencarian" : "Cari program"}
        >
          {searchOpen ? (
            <XIcon className="w-3 h-3" />
          ) : (
            <SearchIcon className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Search slide-in */}
      <div
        className="overflow-hidden transition-all duration-200"
        style={{
          maxHeight: searchOpen ? "40px" : "0px",
          opacity: searchOpen ? 1 : 0,
        }}
      >
        <div className="px-1 pb-2 pt-1">
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
            style={{
              background: "rgba(10,45,135,0.05)",
              border: "1px solid rgba(10,45,135,0.09)",
            }}
          >
            <SearchIcon
              className="w-3 h-3 shrink-0"
              style={{ color: "var(--text-faint)" }}
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari program..."
              className="flex-1 bg-transparent text-[0.75rem] outline-none placeholder:text-[var(--text-faint)]"
              style={{ color: "var(--text-main)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="shrink-0">
                <XIcon
                  className="w-3 h-3"
                  style={{ color: "var(--text-faint)" }}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
          <SidebarMenu>
            {displayed.length === 0 ? (
              <div
                className="px-3 py-4 text-center text-[0.75rem]"
                style={{ color: "var(--text-faint)" }}
              >
                Tidak ada program ditemukan
              </div>
            ) : (
              displayed.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    className="h-8 rounded-lg text-[0.78rem] transition-all duration-150 hover:bg-[rgba(10,45,135,0.07)] hover:text-[var(--blue-navy)] text-[var(--text-muted)]"
                  >
                    <Link href={item.url}>
                      {item.icon ?? (
                        <BookOpenIcon
                          className="!size-3.5 shrink-0"
                          style={{ color: "var(--text-faint)" }}
                        />
                      )}
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.updatedAt && (
                        <span
                          className="shrink-0 text-[10px] tabular-nums"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {item.updatedAt}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}

            {/* Load more / collapse */}
            {!searchOpen && (
              <div className="flex gap-1 mt-0.5">
                {hasMore && (
                  <SidebarMenuItem className="flex-1">
                    <SidebarMenuButton
                      onClick={handleLoadMore}
                      className="h-7 rounded-lg text-[0.74rem] justify-center gap-1 transition-all duration-150 hover:bg-[rgba(10,45,135,0.07)]"
                      style={{ color: "var(--text-faint)" }}
                    >
                      <ChevronDownIcon className="!size-3" />
                      <span>Tampilkan lebih</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isExpanded && (
                  <SidebarMenuItem className={hasMore ? "w-7" : "flex-1"}>
                    <SidebarMenuButton
                      onClick={handleCollapse}
                      className="h-7 rounded-lg text-[0.74rem] justify-center gap-1 transition-all duration-150 hover:bg-[rgba(10,45,135,0.07)]"
                      style={{ color: "var(--text-faint)" }}
                      tooltip="Ciutkan"
                    >
                      <ChevronUpIcon className="!size-3" />
                      {!hasMore && <span>Ciutkan</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {!hasMore && !isExpanded && (
                  <SidebarMenuItem className="flex-1">
                    <SidebarMenuButton
                      asChild
                      className="h-7 rounded-lg text-[0.74rem] justify-center gap-1 transition-all duration-150 hover:bg-[rgba(10,45,135,0.07)]"
                      style={{ color: "var(--text-faint)" }}
                    >
                      <Link href="/dashboard/programs">
                        <span>Lihat semua program</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </div>
            )}
          </SidebarMenu>
      </div>
    </SidebarGroup>
  );
}
