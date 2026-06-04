// app/(dashboard)/dashboard/programs/_modules/ui/components/Table/ProgramTableSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLUMNS = [
  "Program",
  "Kategori",
  "Detail",
  "Status",
  "Batch",
  "Paket",
  "Harga",
  "Diperbarui",
  "",
];

export function ProgramTableSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* Summary strip skeleton */}
      <div className="grid grid-cols-3 sm:grid-cols-5 divide-x divide-neutral-100 border-b border-neutral-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <Skeleton className="h-2.5 w-16 mb-1.5" />
            <Skeleton className="h-5 w-8 mb-1" />
            <Skeleton className="h-2 w-12" />
          </div>
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="flex flex-col gap-2 px-4 py-2.5 border-b border-neutral-100 sm:flex-row sm:items-center sm:justify-between">
        {/* Status tabs skeleton */}
        <div className="flex gap-1.5 flex-wrap">
          {[60, 56, 52, 68, 56].map((w, i) => (
            <Skeleton
              key={i}
              className="h-6 rounded-full"
              style={{ width: w }}
            />
          ))}
        </div>
        {/* Toolbar right skeleton */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-neutral-100">
            {COLUMNS.map((col) => (
              <TableHead
                key={col}
                className="text-[11px] font-medium text-neutral-400 h-9"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-neutral-100">
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-9 rounded-lg shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-6 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-6 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-20 ml-auto" />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2.5 w-14" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Skeleton className="size-6 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
