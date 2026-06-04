// app/(dashboard)/dashboard/programs/_modules/ui/components/Table/ProgramDataTable.tsx
"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";

import {
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  FileX2,
  Search,
  X,
} from "lucide-react";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { FilteredProgram } from "@/app/modules/program/server/program.router";

import ProgramFilters from "../ProgramFilters";

// ─────────────────────────────────────────────────────────────────────────────
// Search Input
// ─────────────────────────────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
  resultCount,
}: {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.length > 0;

  return (
    <div
      className={cn(
        "group relative flex items-center rounded-lg border bg-white transition-all duration-200",
        "w-48 focus-within:w-60 sm:w-56 sm:focus-within:w-72",
        hasValue
          ? "border-blue-300 ring-2 ring-blue-500/10 w-60 sm:w-72"
          : "border-neutral-200 hover:border-neutral-300",
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <Search
        className={cn(
          "absolute left-2.5 size-3.5 shrink-0 transition-colors duration-150 pointer-events-none",
          hasValue
            ? "text-blue-500"
            : "text-neutral-400 group-focus-within:text-blue-400",
        )}
      />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari program…"
        aria-label="Cari program"
        className={cn(
          "h-8 w-full bg-transparent pl-8 pr-8 text-[12px] outline-none",
          "placeholder:text-neutral-400 text-neutral-800",
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />

      <div className="absolute right-2 flex items-center gap-1">
        {hasValue && (
          <>
            <span className="text-[10px] tabular-nums text-blue-500 font-medium">
              {resultCount}
            </span>

            <button
              type="button"
              aria-label="Hapus pencarian"
              className="flex items-center justify-center size-4 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                inputRef.current?.focus();
              }}
            >
              <X className="size-2.5 text-neutral-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const COLUMN_LABELS: Record<string, string> = {
  title: "Program",
  "category.label": "Kategori",
  details: "Detail",
  status: "Status",
  batchCount: "Batch",
  packageCount: "Paket",
  startingPrice: "Harga",
  updatedAt: "Diperbarui",
  createdAt: "Dibuat",
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProgramDataTableProps {
  columns: ColumnDef<FilteredProgram>[];
  data: FilteredProgram[];
  isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProgramDataTable({
  columns,
  data,
  isLoading,
}: ProgramDataTableProps) {
  // ── Table states ──────────────────────────────────────────────────────────

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "status",
      desc: false,
    },
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [globalFilter, setGlobalFilter] = useState("");

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // ── Table instance ────────────────────────────────────────────────────────

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    autoResetPageIndex: false,
  });

  // ── Derived values ────────────────────────────────────────────────────────

  const rows = table.getRowModel().rows;

  const { pageIndex, pageSize } = pagination;

  const totalFiltered = table.getFilteredRowModel().rows.length;

  const from = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1;

  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered);

  const pageCount = table.getPageCount();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePageSizeChange = (value: string) => {
    table.setPageSize(Number(value));
  };

  const getPageNumbers = () => {
    const delta = 2;

    const range: number[] = [];

    const result: (number | "...")[] = [];

    for (
      let i = Math.max(0, pageIndex - delta);
      i <= Math.min(pageCount - 1, pageIndex + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 0) {
      result.push(0);

      if (range[0] > 1) {
        result.push("...");
      }
    }

    result.push(...range);

    if (range[range.length - 1] < pageCount - 1) {
      if (range[range.length - 1] < pageCount - 2) {
        result.push("...");
      }

      result.push(pageCount - 1);
    }

    return result;
  };

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* Toolbar */}

      <div className="flex flex-col border-b border-neutral-100">
        {/* Filters */}

        <div className="flex items-center gap-2 border-b border-neutral-100/80 px-4 py-2.5">
          <ProgramFilters />
        </div>

        {/* Search + actions */}

        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <SearchInput
            value={globalFilter}
            resultCount={totalFiltered}
            onChange={(value) => {
              setGlobalFilter(value);
              table.setPageIndex(0);
            }}
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Column toggle */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-neutral-200 text-xs font-normal text-neutral-600 hover:text-neutral-800"
                >
                  <Columns3 className="size-3.5" />

                  <span className="hidden sm:inline">Kolom</span>

                  <ChevronDown className="size-3 opacity-40" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Tampilkan kolom
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      className="text-xs"
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {COLUMN_LABELS[column.id] ?? column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export */}

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-neutral-200 text-xs font-normal text-neutral-600 hover:text-neutral-800"
            >
              <Download className="size-3.5" />

              <span className="hidden sm:inline">Ekspor</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow
                key={group.id}
                className="border-neutral-100 hover:bg-transparent"
              >
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-9 px-3 text-[11px] font-medium uppercase tracking-wide text-neutral-400",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none transition-colors hover:text-neutral-600",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index} className="border-neutral-100">
                  <TableCell className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-9 rounded-lg shrink-0" />

                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-400">
                    <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
                      <FileX2 className="size-5 opacity-30" />
                    </div>

                    <p className="text-sm font-medium text-neutral-500">
                      Tidak ada program ditemukan
                    </p>

                    <span className="text-xs opacity-60">
                      Coba ubah pencarian atau filter Anda
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-neutral-100 transition-colors hover:bg-neutral-50/60"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}

      {!isLoading && (
        <div className="flex flex-col gap-2 border-t border-neutral-100 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-[11px] tabular-nums text-neutral-400">
              {totalFiltered === 0
                ? "Tidak ada hasil"
                : `Menampilkan ${from}–${to} dari ${totalFiltered}`}
            </p>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-400">Baris</span>

              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-6 w-14 border-neutral-200 px-2 py-0 text-[11px] focus:ring-0">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="text-xs"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center gap-0.5">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
              >
                <ChevronsLeft className="size-3.5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft className="size-3.5" />
              </Button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="px-1 text-[11px] text-neutral-400"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={page}
                    size="icon"
                    className="size-7 text-[11px]"
                    variant={pageIndex === page ? "secondary" : "ghost"}
                    onClick={() => table.setPageIndex(page as number)}
                  >
                    {(page as number) + 1}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRight className="size-3.5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(pageCount - 1)}
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
