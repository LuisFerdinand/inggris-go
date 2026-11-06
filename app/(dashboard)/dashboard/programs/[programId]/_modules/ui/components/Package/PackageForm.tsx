// app/(dashboard)/dashboard/programs/[programId]/_modules/ui/components/Package/PackageForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CheckCircle2, Info, Loader2, Package, Save, Sparkles } from "lucide-react";

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

function parseFeatureLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyFeatures(value: string[] | null | undefined) {
  return (value ?? []).join("\n");
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatRupiahInput(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "";

  return `Rp ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function parseRupiahInput(value: string) {
  const digits = onlyDigits(value);

  if (!digits) return null;

  return Number(digits);
}

function RupiahInput({
  value,
  onChange,
  onBlur,
  placeholder = "Rp 0",
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  return (
    <Input
      inputMode="numeric"
      placeholder={placeholder}
      className={inputCls}
      value={formatRupiahInput(value)}
      onChange={(e) => {
        onChange(parseRupiahInput(e.target.value));
      }}
      onBlur={onBlur}
    />
  );
}

function FeaturesTextarea({
  value,
  onChange,
  onBlur,
}: {
  value: string[] | null | undefined;
  onChange: (value: string[]) => void;
  onBlur?: () => void;
}) {
  const valueKey = stringifyFeatures(value);
  const [draft, setDraft] = useState(valueKey);

  useEffect(() => {
    setDraft(valueKey);
  }, [valueKey]);

  const parsed = parseFeatureLines(draft);

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        rows={6}
        placeholder={"Akses kelas live\nRekaman kelas\nSertifikat\nGrup komunitas"}
        className={textareaCls}
        value={draft}
        onChange={(e) => {
          const next = e.target.value;

          // Keep the raw textarea text so Enter/new lines stay visible.
          setDraft(next);

          // But still save clean array data into react-hook-form.
          onChange(parseFeatureLines(next));
        }}
        onBlur={() => {
          const normalized = parseFeatureLines(draft);

          // Normalize only after user leaves the field.
          setDraft(normalized.join("\n"));
          onChange(normalized);
          onBlur?.();
        }}
      />

      {parsed.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
            Preview fitur
          </p>

          <div className="flex flex-col gap-1.5">
            {parsed.map((feature, index) => (
              <div
                key={`${feature}-${index}`}
                className="flex items-start gap-2 text-[12px] text-neutral-600"
              >
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

const PACKAGE_TEMPLATES: {
  label: string;
  values: Pick<
    PackageFormValues,
    "title" | "description" | "price" | "originalPrice" | "features"
  >;
}[] = [
  {
    label: "Reguler",
    values: {
      title: "Reguler",
      description: "Paket standar untuk mulai belajar.",
      price: 0,
      originalPrice: null,
      features: ["Akses kelas live", "Materi pembelajaran", "Grup komunitas"],
    },
  },
  {
    label: "Premium",
    values: {
      title: "Premium",
      description: "Paket lengkap dengan pendampingan lebih intens.",
      price: 0,
      originalPrice: null,
      features: [
        "Semua benefit paket Reguler",
        "Rekaman kelas",
        "Sertifikat",
        "Feedback personal dari tutor",
      ],
    },
  },
  {
    label: "Trial / Starter",
    values: {
      title: "Trial Class",
      description: "Coba dulu sebelum ikut program penuh.",
      price: 0,
      originalPrice: null,
      features: ["1 sesi percobaan", "Konsultasi level"],
    },
  },
  {
    label: "Hubungi Admin",
    values: {
      title: "Paket Khusus",
      description: "Harga menyesuaikan kebutuhan. Hubungi admin untuk penawaran.",
      price: 0,
      originalPrice: null,
      features: [],
    },
  },
];

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
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const priceValue = watch("price");
  const originalPriceValue = watch("originalPrice");

  // Existing packages of this program, offered as "copy from" sources.
  const programPackagesQuery = trpc.packages.listByProgram.useQuery(
    { programId },
    { enabled: mode === "create" },
  );
  const copyableSources = (programPackagesQuery.data ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    price: number;
    originalPrice: number | null;
    features: string[] | null;
    batch?: { title: string } | null;
  }>;

  function applyValues(
    values: Pick<
      PackageFormValues,
      "title" | "description" | "price" | "originalPrice" | "features"
    >,
  ) {
    const opts = { shouldDirty: true, shouldValidate: true } as const;
    setValue("title", values.title, opts);
    setValue("description", values.description ?? "", opts);
    setValue("price", values.price, opts);
    setValue("originalPrice", values.originalPrice ?? null, opts);
    setValue("features", values.features ?? [], opts);
  }

  const discountPercent =
    originalPriceValue && priceValue > 0 && originalPriceValue > priceValue
      ? Math.round(((originalPriceValue - priceValue) / originalPriceValue) * 100)
      : null;
  const originalPriceInvalid =
    !!originalPriceValue && originalPriceValue <= (priceValue ?? 0);

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
    if (mode === "create") {
      createMutation.mutate(values);
    } else if (packageId) {
      updateMutation.mutate({ id: packageId, ...values });
    }
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

      {mode === "create" && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-[12px] font-bold text-blue-800">Mulai cepat</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-blue-700/80">
            Pilih contoh untuk mengisi form otomatis, lalu sesuaikan harganya.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {PACKAGE_TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => applyValues(t.values)}
                className="rounded-full border border-blue-200 bg-white px-3 py-1 text-[11.5px] font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
              >
                {t.label}
              </button>
            ))}
          </div>

          {copyableSources.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-blue-800">
                Atau salin dari paket yang sudah ada
              </label>
              <select
                defaultValue=""
                onChange={(e) => {
                  const src = copyableSources.find((p) => p.id === e.target.value);
                  if (!src) return;
                  applyValues({
                    title: src.title,
                    description: src.description ?? "",
                    price: src.price,
                    originalPrice: src.originalPrice ?? null,
                    features: src.features ?? [],
                  });
                  e.target.value = "";
                }}
                className="h-9 rounded-lg border border-blue-200 bg-white px-2.5 text-[12px] text-neutral-700 outline-none focus:border-blue-400"
              >
                <option value="">Pilih paket…</option>
                {copyableSources.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                    {p.batch?.title ? ` — ${p.batch.title}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

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

          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <FieldWrap label="Harga" error={errors.price?.message}>
                <RupiahInput
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  onBlur={field.onBlur}
                  placeholder="Rp 0"
                />
              </FieldWrap>
            )}
          />

          <Controller
            control={control}
            name="originalPrice"
            render={({ field }) => (
              <FieldWrap
                label="Harga Coret"
                hint="Opsional"
                error={errors.originalPrice?.message}
              >
                <RupiahInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Rp 1.500.000"
                />
              </FieldWrap>
            )}
          />

          <div className="flex flex-col gap-1 sm:col-span-2">
            {!priceValue && (
              <p className="text-[11.5px] leading-relaxed text-amber-700">
                Harga Rp 0 akan tampil sebagai “Hubungi Admin” di website dan
                tidak dihitung sebagai “Harga mulai”.
              </p>
            )}
            {discountPercent !== null && (
              <p className="text-[11.5px] leading-relaxed text-emerald-700">
                Diskon {discountPercent}% dari harga coret.
              </p>
            )}
            {originalPriceInvalid && (
              <p className="text-[11.5px] leading-relaxed text-red-600">
                Harga coret harus lebih besar dari harga, atau kosongkan.
              </p>
            )}
          </div>
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
                hint="Tekan Enter untuk membuat fitur baru. Satu baris = satu fitur."
                error={
                  Array.isArray(errors.features)
                    ? "Fitur tidak valid"
                    : errors.features?.message
                }
              >
                <FeaturesTextarea
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
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
            className="h-8 rounded-lg border border-blue-600 bg-blue-600 px-3 text-[12px] font-semibold text-white shadow-sm hover:border-blue-700 hover:bg-blue-700"
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