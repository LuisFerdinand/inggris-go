// app/(dashboard)/dashboard/programs/_modules/ui/components/Form/ProgramFormScreen.tsx
"use client";

import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { ProgramForm } from "./ProgramForm";
import type { ProgramFormValues } from "@/app/modules/program/program.schema";

interface ProgramFormScreenProps {
  programId?: string; // present → edit, absent → create
}

export function ProgramFormScreen({ programId }: ProgramFormScreenProps) {
  const categoriesQuery = trpc.programs.getCategories.useQuery();
  const programQuery = trpc.programs.getById.useQuery(
    { id: programId ?? "" },
    { enabled: !!programId },
  );

  const loading =
    categoriesQuery.isLoading || (!!programId && programQuery.isLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  const p = programQuery.data;

  const defaultValues: Partial<ProgramFormValues> | undefined = p
    ? {
        title: p.title,
        slug: p.slug,
        description: p.description,
        shortDesc: p.shortDesc ?? "",
        categoryId: p.categoryId,
        status: p.status,
        scheduleType: p.scheduleType,
        registrationType: p.registrationType,
        format: p.format,
        level: p.level,
        duration: p.duration ?? undefined,
        startingPrice: p.startingPrice ?? undefined,
        startingOriginalPrice: p.startingOriginalPrice ?? undefined,
        badge: p.badge ?? "",
        highlight: p.highlight ?? "",
        thumbnailUrl: p.thumbnailUrl ?? "",
        order: p.order ?? 0,
      }
    : undefined;

  return (
    <ProgramForm
      mode={programId ? "edit" : "create"}
      programId={programId}
      categories={categoriesQuery.data ?? []}
      defaultValues={defaultValues}
    />
  );
}