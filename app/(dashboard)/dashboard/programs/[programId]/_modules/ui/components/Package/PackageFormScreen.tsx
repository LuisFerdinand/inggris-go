// app/(dashboard)/dashboard/programs/[programId]/_modules/ui/components/Package/PackageFormScreen.tsx
"use client";

import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { PackageForm } from "./PackageForm";
import type { PackageFormValues } from "@/app/modules/program/package.schema";

interface PackageFormScreenProps {
  programId: string;
  packageId?: string; // present → edit
  batchId?: string | null; // create-time scope
}

export function PackageFormScreen({
  programId,
  packageId,
  batchId,
}: PackageFormScreenProps) {
  const pkgQuery = trpc.packages.getById.useQuery(
    { id: packageId ?? "" },
    { enabled: !!packageId },
  );

  if (packageId && pkgQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  const p = pkgQuery.data;

  const defaultValues: Partial<PackageFormValues> | undefined = p
    ? {
        programId,
        batchId: p.batchId ?? null,
        title: p.title,
        description: p.description ?? "",
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        isDefault: p.isDefault,
        features: p.features ?? [],
      }
    : undefined;

  return (
    <PackageForm
      mode={packageId ? "edit" : "create"}
      programId={programId}
      // On edit, the batch scope comes from the loaded package, not the URL.
      batchId={p ? (p.batchId ?? null) : (batchId ?? null)}
      packageId={packageId}
      defaultValues={defaultValues}
    />
  );
}