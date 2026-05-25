"use client";
// ─── ProgramDetailPage.tsx ────────────────────────────────────────────────────
// Public-facing program detail page using the new 3-entity architecture.
// Package resolution: batch-specific → fallback to global.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Users,
  Clock,
  MapPin,
  Check,
  Globe,
  BookOpen,
  Zap,
  ChevronDown,
  Tag,
  Star,
  TrendingDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

// ─── Types (derived from router output) ──────────────────────────────────────

type Program = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  format: string;
  level: string;
  duration?: number | null;
  badge?: string | null;
  highlight?: string | null;
  thumbnail?: string | null;
  startingPrice?: number | null;
  startingOriginalPrice?: number | null;
  category: { id: string; label: string; icon?: string | null };
  batches: Batch[];
  packages: Package[]; // global packages
};

type Batch = {
  id: string;
  title: string;
  status: string;
  isOpen: boolean;
  startDate?: string | null;
  endDate?: string | null;
  capacity?: number | null;
  enrolledCount: number;
  mode?: string | null;
  location?: string | null;
  meetingDays?: string[] | null;
  meetingTime?: string | null;
  notes?: string | null;
  packages: Package[]; // batch-specific packages
};

type Package = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  isDefault: boolean;
  order: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIDR(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function discountPct(original: number, sale: number): number | null {
  if (original <= sale) return null;
  return Math.round(((original - sale) / original) * 100);
}

/** Core package resolution logic matching the server-side equivalent. */
function resolvePackages(
  batch: Batch | null,
  globalPackages: Package[],
): { packages: Package[]; scope: "batch" | "global" } {
  if (batch && batch.packages.length > 0) {
    return { packages: batch.packages, scope: "batch" };
  }
  return { packages: globalPackages, scope: "global" };
}

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  online: <Globe className="size-4" />,
  offline: <BookOpen className="size-4" />,
  hybrid: <Zap className="size-4" />,
};

// ─── Batch Selector ───────────────────────────────────────────────────────────

function BatchSelector({
  batches,
  selectedId,
  onSelect,
}: {
  batches: Batch[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (batches.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-neutral-700">
        Select a Schedule
      </p>
      <div className="space-y-2">
        {batches.map((batch) => {
          const isFull =
            batch.capacity != null && batch.enrolledCount >= batch.capacity;
          const isSelected = selectedId === batch.id;

          return (
            <button
              key={batch.id}
              type="button"
              disabled={!batch.isOpen || isFull}
              onClick={() => onSelect(isSelected ? null : batch.id)}
              className={cn(
                "w-full flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-neutral-200 hover:border-neutral-300 bg-white",
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2 mt-0.5 transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "border-neutral-300",
                )}
              >
                {isSelected && (
                  <Check className="size-2.5 text-white" strokeWidth={3} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-800">
                  {batch.title}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                  {batch.startDate && (
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <CalendarDays className="size-3" />
                      {new Date(batch.startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {batch.meetingTime && (
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <Clock className="size-3" />
                      {batch.meetingTime}
                    </span>
                  )}
                  {batch.location && (
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="size-3" />
                      {batch.location}
                    </span>
                  )}
                  {batch.capacity != null && (
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <Users className="size-3" />
                      {batch.enrolledCount} / {batch.capacity}
                      {isFull && (
                        <span className="ml-1 font-semibold text-red-500">
                          Full
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {batch.notes && (
                  <p className="mt-1.5 text-xs text-neutral-400">
                    {batch.notes}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Package Selector ─────────────────────────────────────────────────────────

function PackageSelector({
  packages,
  scope,
  selectedId,
  onSelect,
}: {
  packages: Package[];
  scope: "batch" | "global";
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (packages.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-100 bg-neutral-50 py-8 text-center">
        <p className="text-sm text-neutral-400">No packages available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-neutral-700">
          Choose a Package
        </p>
        {scope === "global" && packages.length > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-wide bg-neutral-100 text-neutral-500 rounded px-1.5 py-0.5">
            Program-wide
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {packages.map((pkg) => {
          const disc = pkg.originalPrice
            ? discountPct(pkg.originalPrice, pkg.price)
            : null;
          const isSelected = selectedId === pkg.id;

          return (
            <motion.button
              key={pkg.id}
              type="button"
              onClick={() => onSelect(pkg.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "relative w-full flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150",
                isSelected
                  ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                  : "border-neutral-200 hover:border-neutral-300 bg-white",
              )}
            >
              {pkg.isDefault && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">
                  <Star className="size-2.5" />
                  Popular
                </span>
              )}

              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2 mt-0.5 transition-all",
                  isSelected
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-neutral-300",
                )}
              >
                {isSelected && (
                  <Check className="size-2.5 text-white" strokeWidth={3} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-neutral-800">
                  {pkg.title}
                </p>
                {pkg.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {pkg.description}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                {pkg.originalPrice != null && pkg.originalPrice > pkg.price && (
                  <p className="text-xs text-neutral-400 line-through">
                    {formatIDR(pkg.originalPrice)}
                  </p>
                )}
                <p className="text-base font-black text-neutral-900">
                  {pkg.price === 0 ? "Free" : formatIDR(pkg.price)}
                </p>
                {disc !== null && (
                  <span className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-600">
                    <TrendingDown className="size-3" />
                    {disc}% off
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Registration Panel ───────────────────────────────────────────────────────

function RegistrationPanel({ program }: { program: Program }) {
  const hasBatches = program.batches.length > 0;

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    hasBatches ? (program.batches[0]?.id ?? null) : null,
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );

  const selectedBatch = useMemo(
    () => program.batches.find((b) => b.id === selectedBatchId) ?? null,
    [program.batches, selectedBatchId],
  );

  const { packages, scope } = useMemo(
    () => resolvePackages(selectedBatch, program.packages),
    [selectedBatch, program.packages],
  );

  // Reset package selection when the resolved packages change
  React.useEffect(() => {
    const defaultPkg = packages.find((p) => p.isDefault) ?? packages[0];
    setSelectedPackageId(defaultPkg?.id ?? null);
  }, [packages]);

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId],
  );

  const canRegister =
    (!hasBatches || selectedBatchId !== null) && selectedPackageId !== null;

  const handleRegister = () => {
    if (!selectedPackageId) return;
    // Navigate to checkout with selected batch + package
    const params = new URLSearchParams({
      packageId: selectedPackageId,
      ...(selectedBatchId ? { batchId: selectedBatchId } : {}),
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden sticky top-6">
      {/* Header with starting price */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <p className="text-xs text-neutral-400 font-medium mb-1">
          Starting from
        </p>
        {program.startingPrice != null ? (
          <div className="flex items-baseline gap-2">
            {program.startingOriginalPrice != null &&
              program.startingOriginalPrice > program.startingPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatIDR(program.startingOriginalPrice)}
                </span>
              )}
            <span className="text-2xl font-black text-neutral-900">
              {program.startingPrice === 0
                ? "Free"
                : formatIDR(program.startingPrice)}
            </span>
          </div>
        ) : (
          <p className="text-lg font-semibold text-neutral-400 italic">
            Pricing TBD
          </p>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Batch selector (only if program has batches) */}
        {hasBatches && (
          <BatchSelector
            batches={program.batches}
            selectedId={selectedBatchId}
            onSelect={setSelectedBatchId}
          />
        )}

        {/* Package selector — resolves batch-specific or global */}
        <PackageSelector
          packages={packages}
          scope={scope}
          selectedId={selectedPackageId}
          onSelect={setSelectedPackageId}
        />

        {/* Order summary */}
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 space-y-2"
          >
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Summary
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">{selectedPackage.title}</span>
              <span className="font-semibold text-neutral-800">
                {selectedPackage.price === 0
                  ? "Free"
                  : formatIDR(selectedPackage.price)}
              </span>
            </div>
            {selectedBatch && (
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Batch</span>
                <span>{selectedBatch.title}</span>
              </div>
            )}
          </motion.div>
        )}

        <button
          type="button"
          disabled={!canRegister}
          onClick={handleRegister}
          className={cn(
            "w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-150",
            canRegister
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed",
          )}
        >
          {canRegister ? "Register Now" : "Select a package to continue"}
        </button>

        {!canRegister && hasBatches && selectedBatchId === null && (
          <p className="text-center text-xs text-neutral-400">
            Please select a batch first.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgramDetailPage() {
  const {
    data: program,
    isLoading,
    error,
  } = trpc.programs.getBySlug.useQuery(
    { slug: "private-class" },
    { staleTime: 60_000 },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex flex-col items-center gap-3 py-32 text-center">
        <AlertCircle className="size-10 text-red-300" />
        <p className="text-sm font-semibold text-neutral-500">
          Program not found or unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
        {/* Left: program info */}
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                {FORMAT_ICONS[program.format]}
                {program.format}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                {program.level}
              </span>
              {program.badge && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  {program.badge}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black text-neutral-900">
              {program.title}
            </h1>

            {program.shortDesc && (
              <p className="text-base text-neutral-600 leading-relaxed">
                {program.shortDesc}
              </p>
            )}

            {program.highlight && (
              <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                <Star className="size-4 text-blue-500" />
                {program.highlight}
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {program.thumbnailUrl && (
            <div className="overflow-hidden rounded-2xl aspect-video bg-neutral-100">
              <img
                src={program.thumbnailUrl}
                alt={program.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="prose prose-sm max-w-none text-neutral-700">
            <h2 className="text-lg font-bold text-neutral-800 mb-3">
              About this program
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap">
              {program.description}
            </p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4">
            {program.duration && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Clock className="size-4 text-neutral-400" />
                {program.duration} hours
              </div>
            )}
            {program.category && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Tag className="size-4 text-neutral-400" />
                {program.category.label}
              </div>
            )}
          </div>

          {/* Batches overview (informational) */}
          {program.batches.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-neutral-800 mb-3">
                Available Schedules
              </h2>
              <div className="space-y-2">
                {program.batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="rounded-xl border border-neutral-200 p-4 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">
                          {batch.title}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                          {batch.startDate && (
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <CalendarDays className="size-3" />
                              {new Date(batch.startDate).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          )}
                          {batch.location && (
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <MapPin className="size-3" />
                              {batch.location}
                            </span>
                          )}
                          {batch.capacity && (
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <Users className="size-3" />
                              {batch.enrolledCount}/{batch.capacity} enrolled
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          batch.isOpen
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-100 text-neutral-500",
                        )}
                      >
                        {batch.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: registration panel */}
        <RegistrationPanel program={program as any} />
      </div>
    </div>
  );
}
