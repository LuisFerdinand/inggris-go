// app/(dashboard)/dashboard/programs/[programId]/_modules/ui/components/Package/PackageForm.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Info, Loader2, Package, Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/client";

import {
  packageInsertSchema,
  type PackageFormValues,
} from "@/app/modules/program/package.schema";
import {
  FieldWrap,
  InfoNotice,
  inputCls,
  textareaCls,
} from "../../../tabs/detail";

const emptyPackageValues: PackageFormValues = {
  programId: "",
  batchId: null,
  title: "",
  description: "",
  price: 0,
  originalPrice: null,
  isDefault: false,
  features: [],
};

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

interface PackageFormProps {
  mode: "create" | "edit";
  programId: string;
  batchId?: string | null;
  packageId?: string;
  defaultValues?: Partial<PackageFormValues>;
  onCancel?: () => void;
  onDone?: () => void;
}

export function PackageForm({
  mode,
  programId,
  batchId,
  packageId,
  defaultValues,
  onCancel,
  onDone,
}: PackageFormProps) {
  const utils = trpc.useUtils();

  const pkgQuery = trpc.packages.getById.useQuery(
    { id: packageId ?? "" },
    { enabled: mode === "edit" && !!packageId && !defaultValues },
  );

  const loadedPackage = pkgQuery.data;
  const loadedValues = useMemo<Partial<PackageFormValues> | undefined>(() => {
    if (!loadedPackage) return undefined;

    return {
      programId,
      batchId: loadedPackage.batchId ?? null,
      title: loadedPackage.title,
      description: loadedPackage.description ?? "",
      price: loadedPackage.price,
      originalPrice: loadedPackage.originalPrice ?? null,
      isDefault: loadedPackage.isDefault,
      features: loadedPackage.features ?? [],
    };
  }, [loadedPackage, programId]);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageInsertSchema),
    defaultValues: {
      ...emptyPackageValues,
      programId,
      batchId: batchId ?? null,
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
    if (mode === "edit" && packageId && !defaultValues && !loadedValues) return;

    reset({
      ...emptyPackageValues,
      programId,
      batchId: batchId ?? null,
      ...defaultValues,
      ...loadedValues,
    });
  }, [batchId, defaultValues, loadedValues, mode, packageId, programId, reset]);

  const handleSuccess = () => {
    utils.packages.listByProgram.invalidate({ programId });
    utils.batches.listByProgram.invalidate({ programId });
    utils.programs.getDetail.invalidate({ id: programId });
    if (packageId) utils.packages.getById.invalidate({ id: packageId });
    toast.success(
      mode === "create" ? "Paket dibuat" : "Perubahan paket tersimpan",
    );
    onDone?.();
  };

  const createMutation = trpc.packages.create.useMutation({
    onSuccess: handleSuccess,
  });
  const updateMutation = trpc.packages.update.useMutation({
    onSuccess: handleSuccess,
  });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: PackageFormValues) => {
    if (mode === "create") createMutation.mutate(values);
    else if (packageId) updateMutation.mutate({ id: packageId, ...values });
  };

  if (mode === "edit" && packageId && pkgQuery.isLoading && !defaultValues) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register("programId")} />
      <input type="hidden" {...register("batchId")} />

      <FormSection
        icon={<Package className="size-4" />}
        title="Detail Paket"
        description="Opsi pendaftaran yang bisa dipilih peserta."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrap
            label="Judul"
            required
            error={errors.title?.message}
            className="sm:col-span-2"
          >
            <Input
              placeholder="Mis. Reguler / VIP / Trial Class"
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
              placeholder="Ringkasan paket ini"
              className={textareaCls}
              {...register("description")}
            />
          </FieldWrap>

          <FieldWrap label="Harga (Rp)" error={errors.price?.message}>
            <Input
              type="number"
              min={0}
              placeholder="0 = Gratis"
              className={inputCls}
              {...register("price")}
            />
          </FieldWrap>

          <FieldWrap
            label="Harga Coret (Rp)"
            hint="Opsional"
            error={errors.originalPrice?.message}
          >
            <Input
              type="number"
              min={0}
              placeholder="Opsional"
              className={inputCls}
              {...register("originalPrice")}
            />
          </FieldWrap>
        </div>
      </FormSection>

      <FormSection
        icon={<Sparkles className="size-4" />}
        title="Fitur & Highlight"
        description="Tulis benefit paket agar mudah dibandingkan."
      >
        <div className="grid gap-4">
          <Controller
            control={control}
            name="features"
            render={({ field }) => (
              <FieldWrap
                label="Fitur"
                hint="Satu fitur per baris"
                error={
                  Array.isArray(errors.features)
                    ? "Fitur tidak valid"
                    : errors.features?.message
                }
              >
                <Textarea
                  rows={6}
                  placeholder={
                    "Akses kelas live\nRekaman kelas\nSertifikat\nGrup komunitas"
                  }
                  className={textareaCls}
                  value={(field.value ?? []).join("\n")}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </FieldWrap>
            )}
          />

          <Controller
            control={control}
            name="isDefault"
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3">
                <div>
                  <p className="text-[13px] font-bold text-neutral-800">
                    Paket Default
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                    Disorot sebagai pilihan utama. Hanya satu default per scope
                    program atau batch.
                  </p>
                </div>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
        </div>
      </FormSection>

      <InfoNotice icon={<Info className="size-3.5" />}>
        Perubahan harga hanya berlaku untuk pendaftaran baru. Order lama tetap
        memakai snapshot harga saat transaksi dibuat.
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
            {mode === "create" ? "Buat Paket" : "Simpan Paket"}
          </Button>
        </div>
      </div>
    </form>
  );
}
