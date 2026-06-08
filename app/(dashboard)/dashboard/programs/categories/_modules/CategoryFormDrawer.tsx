// app/(dashboard)/dashboard/programs/categories/_modules/CategoryFormDrawer.tsx
"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Tags, X } from "lucide-react";
import toast from "react-hot-toast";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  FormField,
  StyledInput,
  StyledTextarea,
  SelectInput,
} from "@/components/Form";
import { IconPicker } from "@/components/IconPicker";
import {
  categoryInsertSchema,
  type CategoryFormValues,
} from "@/app/modules/program/category.schema";

import type { CategoryDrawerState } from "./CategoriesView";

const STATUS_OPTIONS = [
  { id: "draft", label: "Draf" },
  { id: "published", label: "Terbit" },
  { id: "archived", label: "Diarsip" },
];

const EMPTY: CategoryFormValues = {
  label: "",
  slug: "",
  shortLabel: "",
  status: "draft",
  icon: "",
  heroImage: "",
  themePrimary: "#4da3ff",
  tagline: "",
  taglineAccent: "",
  description: "",
  forWho: "",
  quickDecisionLabel: "",
  quickDecisionDesc: "",
};

/* ─────────────────────────────────────────────────────────────
   DRAWER SHELL
───────────────────────────────────────────────────────────── */

function DrawerShell({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Tutup"
            className="fixed inset-0 z-40 bg-[rgba(6,15,46,0.40)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden border-l border-neutral-200 bg-white shadow-2xl sm:rounded-l-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/40 px-6 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm">
                  <Tags className="size-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[13px] font-bold tracking-tight text-neutral-800">
                    {title}
                  </h2>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-400">
                    {description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 shadow-sm transition hover:text-neutral-700"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────
   FORM
───────────────────────────────────────────────────────────── */

interface CategoryFormDrawerProps {
  state: CategoryDrawerState;
  onClose: () => void;
}

export function CategoryFormDrawer({ state, onClose }: CategoryFormDrawerProps) {
  const open = state !== null;
  const isEditing = open && state !== "new";
  const categoryId = isEditing ? (state as string) : undefined;

  const utils = trpc.useUtils();

  const detailQuery = trpc.categories.getById.useQuery(
    { id: categoryId ?? "" },
    { enabled: !!categoryId },
  );

  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryInsertSchema),
    defaultValues: EMPTY,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Populate / reset whenever the drawer target changes.
  useEffect(() => {
    if (!open) return;

    if (!isEditing) {
      reset(EMPTY);
      return;
    }

    const c = detailQuery.data;
    if (c) {
      reset({
        label: c.label ?? "",
        slug: c.slug ?? "",
        shortLabel: c.shortLabel ?? "",
        status: c.status,
        icon: c.icon ?? "",
        heroImage: c.heroImage ?? "",
        themePrimary: c.themePrimary ?? "#4da3ff",
        tagline: c.tagline ?? "",
        taglineAccent: c.taglineAccent ?? "",
        description: c.description ?? "",
        forWho: c.forWho ?? "",
        quickDecisionLabel: c.quickDecisionLabel ?? "",
        quickDecisionDesc: c.quickDecisionDesc ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, detailQuery.data]);

  async function onSubmit(values: CategoryFormValues) {
    const toastId = toast.loading(
      isEditing ? "Menyimpan kategori…" : "Membuat kategori…",
    );
    try {
      if (isEditing && categoryId) {
        await updateMutation.mutateAsync({ id: categoryId, ...values });
      } else {
        await createMutation.mutateAsync(values);
      }

      await utils.categories.getFiltered.invalidate();
      if (categoryId) await utils.categories.getById.invalidate({ id: categoryId });

      toast.success(isEditing ? "Kategori disimpan" : "Kategori dibuat", {
        id: toastId,
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message, { id: toastId });
    }
  }

  const loadingDetail = isEditing && detailQuery.isLoading;

  return (
    <DrawerShell
      open={open}
      title={isEditing ? "Edit Kategori" : "Kategori Baru"}
      description="Identitas, branding, dan teks pemasaran kategori program."
      onClose={onClose}
    >
      {loadingDetail ? (
        <div className="flex items-center justify-center py-24 text-neutral-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full flex-col"
          noValidate
        >
          <div className="flex flex-1 flex-col gap-5 px-5 py-5">
            <FormField label="Label" required error={errors.label?.message}>
              <StyledInput
                {...register("label")}
                placeholder="Contoh: Program Online"
                error={!!errors.label}
                maxLength={60}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Slug"
                hint="Kosongkan untuk dibuat otomatis dari label"
                error={errors.slug?.message}
              >
                <StyledInput
                  {...register("slug")}
                  placeholder="program-online"
                  error={!!errors.slug}
                />
              </FormField>

              <FormField label="Label Singkat" error={errors.shortLabel?.message}>
                <StyledInput
                  {...register("shortLabel")}
                  placeholder="Online"
                  maxLength={40}
                />
              </FormField>
            </div>

            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <FormField label="Status" required error={fieldState.error?.message}>
                  <SelectInput
                    options={STATUS_OPTIONS}
                    variant="dropdown"
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    placeholder="Pilih status"
                    error={!!fieldState.error}
                  />
                </FormField>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="icon"
                control={control}
                render={({ field, fieldState }) => (
                  <FormField label="Icon" error={fieldState.error?.message}>
                    <IconPicker
                      value={field.value ?? undefined}
                      onChange={(name) => field.onChange(name ?? "")}
                      placeholder="Pilih icon"
                    />
                  </FormField>
                )}
              />

              <Controller
                name="themePrimary"
                control={control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Warna Tema"
                    hint="Hex, mis. #4da3ff"
                    error={fieldState.error?.message}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.value || "#4da3ff"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
                      />
                      <StyledInput
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="#4da3ff"
                        error={!!fieldState.error}
                      />
                    </div>
                  </FormField>
                )}
              />
            </div>

            <FormField
              label="Hero Image"
              hint="URL atau path publik, mis. /images/categories/online-hero.png"
              error={errors.heroImage?.message}
            >
              <StyledInput
                {...register("heroImage")}
                placeholder="/images/categories/…"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Tagline" error={errors.tagline?.message}>
                <StyledInput
                  {...register("tagline")}
                  placeholder="Kelas Zoom terstruktur —"
                  maxLength={120}
                />
              </FormField>

              <FormField
                label="Tagline Accent"
                error={errors.taglineAccent?.message}
              >
                <StyledInput
                  {...register("taglineAccent")}
                  placeholder="mentor nyata, hasil terukur"
                  maxLength={120}
                />
              </FormField>
            </div>

            <FormField label="Deskripsi" error={errors.description?.message}>
              <StyledTextarea
                {...register("description")}
                rows={3}
                placeholder="Penjelasan singkat tentang kategori ini…"
              />
            </FormField>

            <FormField label="Untuk Siapa" error={errors.forWho?.message}>
              <StyledTextarea
                {...register("forWho")}
                rows={2}
                placeholder="Kamu yang ingin belajar terstruktur dari rumah…"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Quick Decision Label"
                error={errors.quickDecisionLabel?.message}
              >
                <StyledInput
                  {...register("quickDecisionLabel")}
                  placeholder="Saya ingin progress yang jelas"
                />
              </FormField>

              <FormField
                label="Quick Decision Desc"
                error={errors.quickDecisionDesc?.message}
              >
                <StyledInput
                  {...register("quickDecisionDesc")}
                  placeholder="Belajar terstruktur dengan mentor"
                />
              </FormField>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-neutral-100 bg-white/90 px-5 py-3.5 backdrop-blur">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-lg px-4 text-xs font-semibold"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Buat Kategori"}
            </Button>
          </div>
        </form>
      )}
    </DrawerShell>
  );
}