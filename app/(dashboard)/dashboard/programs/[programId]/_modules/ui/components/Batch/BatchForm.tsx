// app/(dashboard)/dashboard/programs/[programId]/_modules/ui/components/Batch/BatchForm.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CalendarClock, Info, Loader2, Save } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  batchInsertSchema,
  type BatchFormValues,
} from "@/app/modules/program/batch.schema";
import { PROGRAM_BATCH_MODE, PROGRAM_BATCH_STATUS } from "@/lib/enums/enums";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldWrap,
  InfoNotice,
  inputCls,
  textareaCls,
} from "../../../tabs/detail";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  open: "Open",
  ongoing: "Ongoing",
  completed: "Completed",
  closed: "Closed",
};

const MODE_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

const emptyBatchValues: BatchFormValues = {
  programId: "",
  title: "",
  description: "",
  status: "draft",
  mode: "online",
  teacherId: null,
  startDate: null,
  endDate: null,
  registrationDeadline: null,
  capacity: null,
  location: "",
  timezone: "WIB",
  notes: "",
  schedules: [],
};

function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-neutral-100 bg-neutral-50/40 px-5 py-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm">
          {icon}
        </div>
        <div>
          <h3 className="text-[13px] font-bold tracking-tight text-neutral-800">
            {title}
          </h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-400">
            {description}
          </p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

interface BatchFormProps {
  mode: "create" | "edit";
  programId: string;
  batchId?: string;
  defaultValues?: Partial<BatchFormValues>;
  onCancel?: () => void;
  onDone?: () => void;
}

export function BatchForm({
  mode,
  programId,
  batchId,
  defaultValues,
  onCancel,
  onDone,
}: BatchFormProps) {
  const utils = trpc.useUtils();

  const teachersQuery = trpc.batches.getTeachers.useQuery();
  const batchQuery = trpc.batches.getById.useQuery(
    { id: batchId ?? "" },
    { enabled: mode === "edit" && !!batchId && !defaultValues },
  );

  const loadedBatch = batchQuery.data;
  const loadedValues = useMemo<Partial<BatchFormValues> | undefined>(() => {
    if (!loadedBatch) return undefined;

    return {
      programId,
      title: loadedBatch.title,
      description: loadedBatch.description ?? "",
      status: loadedBatch.status,
      mode: loadedBatch.mode,
      teacherId: loadedBatch.teacherId ?? null,
      startDate: loadedBatch.startDate ?? null,
      endDate: loadedBatch.endDate ?? null,
      registrationDeadline: loadedBatch.registrationDeadline ?? null,
      capacity: loadedBatch.capacity ?? null,
      location: loadedBatch.location ?? "",
      timezone: loadedBatch.timezone ?? "WIB",
      notes: loadedBatch.notes ?? "",
      schedules: loadedBatch.schedules ?? [],
    };
  }, [loadedBatch, programId]);

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchInsertSchema),
    defaultValues: {
      ...emptyBatchValues,
      programId,
      ...defaultValues,
      ...loadedValues,
    },
  });

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (mode === "edit" && batchId && !defaultValues && !loadedValues) return;

    reset({
      ...emptyBatchValues,
      programId,
      ...defaultValues,
      ...loadedValues,
    });
  }, [batchId, defaultValues, loadedValues, mode, programId, reset]);

  const handleSuccess = () => {
    utils.batches.listByProgram.invalidate({ programId });
    utils.packages.listByProgram.invalidate({ programId });
    utils.programs.getDetail.invalidate({ id: programId });
    if (batchId) utils.batches.getById.invalidate({ id: batchId });
    toast.success(
      mode === "create" ? "Batch dibuat" : "Perubahan batch tersimpan",
    );
    onDone?.();
  };

  const createMutation = trpc.batches.create.useMutation({
    onSuccess: handleSuccess,
  });
  const updateMutation = trpc.batches.update.useMutation({
    onSuccess: handleSuccess,
  });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: BatchFormValues) => {
    if (mode === "create") createMutation.mutate(values);
    else if (batchId) updateMutation.mutate({ id: batchId, ...values });
  };

  if (mode === "edit" && batchId && batchQuery.isLoading && !defaultValues) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register("programId")} />

      <FormSection
        icon={<CalendarClock className="size-4" />}
        title="Informasi Batch"
        description="Identitas, status, pengajar, dan kapasitas cohort."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrap
            label="Judul"
            required
            error={errors.title?.message}
            className="sm:col-span-2"
          >
            <Input
              placeholder="Mis. Batch Januari 2026"
              className={inputCls}
              {...register("title")}
            />
          </FieldWrap>

          <FieldWrap
            label="Deskripsi"
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <Textarea
              rows={3}
              placeholder="Ringkasan singkat batch ini"
              className={textareaCls}
              {...register("description")}
            />
          </FieldWrap>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <FieldWrap label="Status" error={errors.status?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_BATCH_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status] ?? status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrap>
            )}
          />

          <Controller
            control={control}
            name="mode"
            render={({ field }) => (
              <FieldWrap label="Mode" error={errors.mode?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_BATCH_MODE.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {MODE_LABELS[mode] ?? mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrap>
            )}
          />

          <Controller
            control={control}
            name="teacherId"
            render={({ field }) => (
              <FieldWrap
                label="Pengajar"
                hint="Opsional"
                error={errors.teacherId?.message}
              >
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Pilih pengajar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa pengajar</SelectItem>
                    {(teachersQuery.data ?? []).map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrap>
            )}
          />

          <FieldWrap
            label="Kapasitas"
            hint="Kosongkan untuk tanpa batas"
            error={errors.capacity?.message}
          >
            <Input
              type="number"
              min={1}
              placeholder="Mis. 25"
              className={inputCls}
              {...register("capacity")}
            />
          </FieldWrap>
        </div>
      </FormSection>

      <FormSection
        icon={<CalendarClock className="size-4" />}
        title="Jadwal & Lokasi"
        description="Tanggal penyelenggaraan, deadline, lokasi, dan catatan internal."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <FieldWrap
                label="Tanggal Mulai"
                error={errors.startDate?.message}
              >
                <Input
                  type="date"
                  className={inputCls}
                  value={toDateInput(field.value)}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FieldWrap>
            )}
          />

          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <FieldWrap
                label="Tanggal Selesai"
                error={errors.endDate?.message}
              >
                <Input
                  type="date"
                  className={inputCls}
                  value={toDateInput(field.value)}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FieldWrap>
            )}
          />

          <Controller
            control={control}
            name="registrationDeadline"
            render={({ field }) => (
              <FieldWrap
                label="Batas Pendaftaran"
                error={errors.registrationDeadline?.message}
              >
                <Input
                  type="date"
                  className={inputCls}
                  value={toDateInput(field.value)}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FieldWrap>
            )}
          />

          <FieldWrap label="Timezone" error={errors.timezone?.message}>
            <Input placeholder="WIB" className={inputCls} {...register("timezone")} />
          </FieldWrap>

          <FieldWrap
            label="Lokasi"
            hint="Untuk batch offline atau hybrid"
            error={errors.location?.message}
            className="sm:col-span-2"
          >
            <Input
              placeholder="Mis. Kampung Inggris Pare / Zoom / Hybrid"
              className={inputCls}
              {...register("location")}
            />
          </FieldWrap>

          <FieldWrap
            label="Catatan"
            error={errors.notes?.message}
            className="sm:col-span-2"
          >
            <Textarea
              rows={3}
              placeholder="Catatan internal atau info tambahan"
              className={textareaCls}
              {...register("notes")}
            />
          </FieldWrap>
        </div>
      </FormSection>

      <InfoNotice icon={<Info className="size-3.5" />}>
        Perubahan batch akan memengaruhi tampilan pendaftaran baru. Order lama
        tetap memakai snapshot saat transaksi dibuat.
      </InfoNotice>

      <div className="sticky bottom-0 -mx-5 mt-1 border-t border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
            className="h-8 rounded-lg px-3 text-[12px] font-medium text-neutral-500 hover:text-neutral-700"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="h-8 rounded-lg bg-neutral-900 px-3 text-[12px] font-semibold text-white hover:bg-neutral-800"
          >
            {isPending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-3.5" />
            )}
            {mode === "create" ? "Buat Batch" : "Simpan Batch"}
          </Button>
        </div>
      </div>
    </form>
  );
}
