// app/(dashboard)/dashboard/programs/_modules/ui/components/Form/ProgramForm.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  programInsertSchema,
  type ProgramFormValues,
} from "@/app/modules/program/program.schema";

import {
  PROGRAM_STATUS,
  PROGRAM_FORMAT,
  PROGRAM_LEVEL,
  PROGRAM_SCHEDULE_TYPE,
} from "@/lib/enums/enums";
import { REGISTRATION_TYPE } from "@/app/db/schema/programs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Label maps (Indonesian) ──────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  draft: "Draf",
  published: "Terbit",
  scheduled: "Terjadwal",
  archived: "Diarsip",
};
const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};
const LEVEL_LABELS: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Mahir",
};
const SCHEDULE_LABELS: Record<string, string> = {
  permanent: "Permanen",
  scheduled: "Terjadwal",
};
const REGISTRATION_LABELS: Record<string, string> = {
  online: "Online (website)",
  offline: "Offline (admin)",
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Field wrapper — replaces shadcn <FormItem>/<FormLabel>/<FormMessage> ──────

function Field({
  label,
  error,
  description,
  htmlFor,
  className,
  children,
}: {
  label: string;
  error?: string;
  description?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm">
        {label}
      </Label>
      {children}
      {description && (
        <p className="text-[11px] text-neutral-500">{description}</p>
      )}
      {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface ProgramFormProps {
  mode: "create" | "edit";
  programId?: string;
  categories: { id: string; label: string }[];
  defaultValues?: Partial<ProgramFormValues>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProgramForm({
  mode,
  programId,
  categories,
  defaultValues,
}: ProgramFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programInsertSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      shortDesc: "",
      categoryId: "",
      status: "draft",
      scheduleType: "permanent",
      registrationType: "online",
      format: "online",
      level: "beginner",
      duration: undefined,
      startingPrice: undefined,
      startingOriginalPrice: undefined,
      budget: undefined,
      badge: "",
      highlight: "",
      thumbnailUrl: "",
      order: 0,
      ...defaultValues,
    },
  });

  const onSuccess = () => {
    utils.programs.getFiltered.invalidate();
    if (programId) utils.programs.getById.invalidate({ id: programId });
    toast.success(
      mode === "create" ? "Program berhasil dibuat" : "Perubahan tersimpan",
    );
    router.push("/dashboard/programs");
    router.refresh();
  };

  const createMutation = trpc.programs.create.useMutation({ onSuccess });
  const updateMutation = trpc.programs.update.useMutation({ onSuccess });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: ProgramFormValues) => {
    if (mode === "create") {
      createMutation.mutate(values);
    } else if (programId) {
      updateMutation.mutate({ id: programId, ...values });
    }
  };

  // Reusable list for the classification selects
  const classificationSelects = [
    { name: "format", label: "Format", options: PROGRAM_FORMAT, labels: FORMAT_LABELS },
    { name: "level", label: "Level", options: PROGRAM_LEVEL, labels: LEVEL_LABELS },
    { name: "scheduleType", label: "Tipe Jadwal", options: PROGRAM_SCHEDULE_TYPE, labels: SCHEDULE_LABELS },
    { name: "registrationType", label: "Pendaftaran", options: REGISTRATION_TYPE, labels: REGISTRATION_LABELS },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* ── Basic info ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Dasar</CardTitle>
          <CardDescription className="text-xs">
            Identitas utama program.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Field
                label="Judul"
                htmlFor="title"
                error={errors.title?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="title"
                  placeholder="Mis. Bootcamp UI/UX Design"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (mode === "create") {
                      setValue("slug", slugify(e.target.value), {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="slug"
            render={({ field }) => (
              <Field
                label="Slug"
                htmlFor="slug"
                error={errors.slug?.message}
                description="Dipakai di URL publik. Huruf kecil, angka, tanda hubung."
                className="sm:col-span-2"
              >
                <Input id="slug" placeholder="bootcamp-ui-ux" {...field} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Field label="Kategori" error={errors.categoryId?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Field label="Status" error={errors.status?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="shortDesc"
            render={({ field }) => (
              <Field
                label="Deskripsi Singkat"
                htmlFor="shortDesc"
                error={errors.shortDesc?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="shortDesc"
                  placeholder="Satu kalimat untuk kartu/landing"
                  {...field}
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Field
                label="Deskripsi"
                htmlFor="description"
                error={errors.description?.message}
                className="sm:col-span-2"
              >
                <Textarea id="description" rows={4} {...field} />
              </Field>
            )}
          />
        </CardContent>
      </Card>

      {/* ── Classification ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Klasifikasi</CardTitle>
          <CardDescription className="text-xs">
            Format, level, jadwal, dan pendaftaran.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {classificationSelects.map(({ name, label, options, labels }) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <Field
                  label={label}
                  error={errors[name]?.message as string | undefined}
                >
                  <Select
                    value={String(field.value ?? "")}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((o) => (
                        <SelectItem key={o} value={o}>
                          {labels[o as keyof typeof labels] ?? o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          ))}

          <Controller
            control={control}
            name="duration"
            render={({ field }) => (
              <Field
                label="Durasi (hari)"
                htmlFor="duration"
                error={errors.duration?.message}
              >
                <Input
                  id="duration"
                  type="number"
                  min={0}
                  {...field}
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />
        </CardContent>
      </Card>

      {/* ── Pricing & marketing ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Harga & Pemasaran</CardTitle>
          <CardDescription className="text-xs">
            Harga tampilan (harga asli diatur di paket).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="startingPrice"
            render={({ field }) => (
              <Field
                label="Harga Mulai (Rp)"
                htmlFor="startingPrice"
                error={errors.startingPrice?.message}
              >
                <Input
                  id="startingPrice"
                  type="number"
                  min={0}
                  placeholder="0 = Gratis"
                  {...field}
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="startingOriginalPrice"
            render={({ field }) => (
              <Field
                label="Harga Coret (Rp)"
                htmlFor="startingOriginalPrice"
                error={errors.startingOriginalPrice?.message}
              >
                <Input
                  id="startingOriginalPrice"
                  type="number"
                  min={0}
                  {...field}
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="budget"
            render={({ field }) => (
              <Field
                label="Anggaran Program (Rp)"
                htmlFor="budget"
                error={errors.budget?.message}
                description="Alokasi anggaran internal — tidak ditampilkan ke pelanggan."
              >
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  {...field}
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="badge"
            render={({ field }) => (
              <Field label="Badge" htmlFor="badge" error={errors.badge?.message}>
                <Input
                  id="badge"
                  placeholder="Mis. Terlaris"
                  {...field}
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="thumbnailUrl"
            render={({ field }) => (
              <Field
                label="Thumbnail URL"
                htmlFor="thumbnailUrl"
                error={errors.thumbnailUrl?.message}
              >
                <Input
                  id="thumbnailUrl"
                  placeholder="https://…"
                  {...field}
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/programs")}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isPending} className="gap-1.5">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === "create" ? "Buat Program" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}