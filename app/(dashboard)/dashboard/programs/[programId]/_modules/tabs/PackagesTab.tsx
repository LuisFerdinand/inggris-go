// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/PackagesTab.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Star,
  Check,
  Layers,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PackagesTabProps {
  programId: string;
}

function formatIDR(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function PackagesTab({ programId }: PackagesTabProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // batchId in the URL scopes packages to a batch (scheduled programs).
  const [batchId, setBatchId] = useQueryState("batchId", parseAsString);

  const programQuery = trpc.programs.getDetail.useQuery(
    { id: programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );
  const isScheduled = programQuery.data?.scheduleType === "scheduled";

  const batchesQuery = trpc.batches.listByProgram.useQuery(
    { programId },
    { enabled: isScheduled },
  );

  const { data: packages = [], isLoading } = trpc.packages.listByProgram.useQuery(
    { programId, batchId: batchId ?? undefined },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );

  const deletePkg = trpc.packages.remove.useMutation({
    onSuccess: () => {
      utils.packages.listByProgram.invalidate({ programId });
      toast.success("Paket dihapus");
    },
    onError: (err) => toast.error(err.message ?? "Gagal menghapus paket"),
  });

  // For scheduled programs we need a batch selected before showing packages.
  const needsBatch = isScheduled && !batchId;

  const buildCreateHref = () => {
    const qs = new URLSearchParams({ programId });
    if (batchId) qs.set("batchId", batchId);
    return `/dashboard/programs/${programId}/packages/new?${qs.toString()}`;
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus paket "${title}"?`)) deletePkg.mutate({ id });
  };

  if (programQuery.isLoading) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Paket Harga</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isScheduled
              ? "Paket dikelola per batch untuk program scheduled."
              : "Paket dikelola langsung untuk program permanent."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isScheduled && (
            <Select
              value={batchId ?? ""}
              onValueChange={(v) => setBatchId(v || null)}
            >
              <SelectTrigger className="h-9 w-48">
                <SelectValue placeholder="Pilih batch" />
              </SelectTrigger>
              <SelectContent>
                {(batchesQuery.data ?? []).map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={() => router.push(buildCreateHref())}
            disabled={needsBatch}
            className="h-9 gap-1.5 rounded-lg"
          >
            <Plus className="size-3.5" />
            Tambah Paket
          </Button>
        </div>
      </div>

      {/* Body */}
      {needsBatch ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-400">
          <Layers className="size-6 opacity-40" />
          <p className="text-sm font-medium text-neutral-500">Pilih batch terlebih dahulu</p>
          <p className="text-xs">Paket pada program scheduled dikelola per batch.</p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl border border-neutral-200 bg-neutral-50 animate-pulse" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2.5 py-16 text-neutral-400">
          <div className="size-12 rounded-full bg-neutral-100 flex items-center justify-center">
            <Package className="size-5 opacity-30" />
          </div>
          <p className="text-sm font-medium text-neutral-500">Belum ada paket</p>
          <Button onClick={() => router.push(buildCreateHref())} variant="outline" size="sm" className="mt-1 gap-1.5">
            <Plus className="size-3.5" /> Buat paket pertama
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-4 transition-all hover:shadow-sm",
                pkg.isDefault ? "border-violet-300 ring-1 ring-violet-100" : "border-neutral-200",
              )}
            >
              {pkg.isDefault && (
                <span className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="size-2.5" /> Default
                </span>
              )}

              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-neutral-800 leading-snug">{pkg.title}</h3>
              </div>

              {pkg.description && (
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{pkg.description}</p>
              )}

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg font-bold text-neutral-900">{formatIDR(pkg.price)}</span>
                {pkg.originalPrice != null && pkg.originalPrice > pkg.price && (
                  <span className="text-xs text-neutral-400 line-through">{formatIDR(pkg.originalPrice)}</span>
                )}
              </div>

              {pkg.features && pkg.features.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                  {pkg.features.slice(0, 4).map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[12px] text-neutral-600">
                      <Check className="size-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex items-center gap-1.5 pt-3 border-t border-neutral-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 flex-1 gap-1.5 text-xs"
                  onClick={() =>
                    router.push(`/dashboard/programs/${programId}/packages/${pkg.id}/edit`)
                  }
                >
                  <Pencil className="size-3" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7 text-neutral-400 hover:text-red-600 hover:border-red-200"
                  onClick={() => handleDelete(pkg.id, pkg.title)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}