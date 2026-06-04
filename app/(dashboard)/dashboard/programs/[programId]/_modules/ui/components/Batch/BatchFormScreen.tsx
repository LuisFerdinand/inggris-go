// app/(dashboard)/dashboard/programs/[programId]/_modules/ui/components/Batch/BatchFormScreen.tsx
"use client";

import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { BatchForm } from "./BatchForm";
import type { BatchFormValues } from "@/app/modules/program/batch.schema";

interface BatchFormScreenProps {
  programId: string;
  batchId?: string; // present → edit
}

export function BatchFormScreen({ programId, batchId }: BatchFormScreenProps) {
  const batchQuery = trpc.batches.getById.useQuery(
    { id: batchId ?? "" },
    { enabled: !!batchId },
  );

  if (batchId && batchQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  const b = batchQuery.data;

  const defaultValues: Partial<BatchFormValues> | undefined = b
    ? {
        programId,
        title: b.title,
        description: b.description ?? "",
        status: b.status,
        mode: b.mode,
        teacherId: b.teacherId ?? null,
        startDate: b.startDate ?? null,
        endDate: b.endDate ?? null,
        registrationDeadline: b.registrationDeadline ?? null,
        capacity: b.capacity ?? null,
        location: b.location ?? "",
        timezone: b.timezone ?? "WIB",
        notes: b.notes ?? "",
      }
    : undefined;

  return (
    <BatchForm
      mode={batchId ? "edit" : "create"}
      programId={programId}
      batchId={batchId}
      defaultValues={defaultValues}
    />
  );
}