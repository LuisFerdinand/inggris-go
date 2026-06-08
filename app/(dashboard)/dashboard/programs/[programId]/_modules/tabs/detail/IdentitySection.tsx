// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/detail/IdentitySection.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ExternalLink,
  AlertTriangle,
  Copy,
  Pencil,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Link2,
  Globe,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";
import { cn, generateSlug } from "@/lib/utils";
import {
  DetailData,
  FieldWrap,
  InfoNotice,
  inputCls,
  MetaPill,
  ReadField,
  SectionCard,
  SectionDivider,
  StickySaveBar,
  textareaCls,
} from ".";
import { Icon } from "@/components/Icon";
import {
  Category,
  FormField,
  SelectInput,
  StyledInput,
  StyledTextarea,
} from "@/components/Form";

/* ─────────────────────────────────────────────────────────────
   SCHEMA
───────────────────────────────────────────────────────────── */

const schema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(100),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda hubung",
    ),
  shortDesc: z.string().max(200).optional().or(z.literal("")),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  categoryId: z.string().min(1, "Kategori wajib diisi"),
});

type FormValues = z.infer<typeof schema>;

/* ─────────────────────────────────────────────────────────────
   HOOK: Debounce
───────────────────────────────────────────────────────────── */

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ─────────────────────────────────────────────────────────────
   READ MODE
───────────────────────────────────────────────────────────── */

function ReadMode({ data }: { data: DetailData }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `/programs/${data.category.slug}/${data.slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(window.location.origin + publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title + Category row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ReadField label="Judul Program">
          <span className="text-[15px] font-semibold text-neutral-900 leading-snug">
            {data.title}
          </span>
        </ReadField>

        <ReadField label="Kategori">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex items-center justify-center size-7 rounded-xl flex-shrink-0 ring-1 ring-black/5 shadow-sm"
              style={{
                backgroundColor: `${data.category.themePrimary}18`,
                color: data.category.themePrimary,
              }}
            >
              <Icon
                className="size-3.5"
                name={data.category.icon || "book-open"}
              />
            </div>
            <p className="text-[13px] font-semibold text-neutral-900 truncate">
              {data.category.label}
            </p>
          </div>
        </ReadField>
      </div>

      {/* Slug URL */}
      <ReadField label="Slug URL">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 min-w-0">
            <Globe className="size-3 text-neutral-400 flex-shrink-0" />
            <span className="font-mono text-[11.5px] text-neutral-500 truncate">
              /programs/
              <span className="text-neutral-400">{data.category.slug}/</span>
              <span className="text-neutral-800 font-semibold">
                {data.slug}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              onClick={handleCopy}
              whileTap={{ scale: 0.92 }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="flex items-center gap-1 text-emerald-600"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Tersalin
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <Copy className="size-3.5" />
                    Salin
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
            >
              <ExternalLink className="size-3.5" />
              Buka
            </a>
          </div>
        </div>
      </ReadField>

      <SectionDivider label="Deskripsi" />

      <ReadField label="Deskripsi Singkat" empty={!data.shortDesc}>
        {data.shortDesc ? (
          <p className="text-[13px] text-neutral-600 leading-relaxed">
            {data.shortDesc}
          </p>
        ) : null}
      </ReadField>

      <ReadField label="Deskripsi Lengkap" empty={!data.description}>
        {data.description ? (
          <div
            className="prose prose-sm prose-neutral max-w-none text-[13px] text-neutral-600 leading-relaxed line-clamp-5"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        ) : null}
      </ReadField>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLUG PREVIEW BAR
───────────────────────────────────────────────────────────── */

function SlugPreviewBar({
  categorySlug,
  slugValue,
  isEditingSlug,
  onToggleEdit,
  onCopy,
  copied,
  publicUrl,
}: {
  categorySlug: string;
  slugValue: string;
  isEditingSlug: boolean;
  onToggleEdit: () => void;
  onCopy: () => void;
  copied: boolean;
  publicUrl: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-neutral-100 bg-neutral-50/80 flex-wrap gap-y-1.5">
      <div className="flex items-center gap-1.5 min-w-0 font-mono text-[12px]">
        <Globe className="size-3 text-neutral-400 flex-shrink-0" />
        <span className="text-neutral-400 truncate">
          /programs/{categorySlug}/
        </span>
        <span className="text-neutral-700 font-semibold truncate">
          {slugValue || "nama-program"}
        </span>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <motion.button
          type="button"
          onClick={onCopy}
          whileTap={{ scale: 0.9 }}
          className="inline-flex items-center justify-center size-7 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          title="Salin URL"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <Copy className="size-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center size-7 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          title="Buka di tab baru"
        >
          <ExternalLink className="size-3.5" />
        </a>

        <button
          type="button"
          onClick={onToggleEdit}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-medium transition-all duration-200",
            isEditingSlug
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800",
          )}
        >
          <Pencil className="size-3" />
          {isEditingSlug ? "Selesai Edit" : "Edit Slug"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EDIT MODE
───────────────────────────────────────────────────────────── */

function EditMode({
  data,
  form,
  categories,
  isLoadingCategories,
}: {
  data: DetailData;
  form: ReturnType<typeof useForm<FormValues>>;
  categories: Category[];
  isLoadingCategories: boolean;
}) {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = form;

  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [copied, setCopied] = useState(false);
  // Track whether the slug has been manually overridden by the user
  const slugManuallyEdited = useRef(false);

  const titleVal = watch("title");
  const slugVal = watch("slug");
  const categoryId = watch("categoryId");

  const debouncedTitle = useDebounce(titleVal, 400);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const displayCategorySlug = selectedCategory?.slug ?? data.category.slug;
  const publicUrl = `/programs/${displayCategorySlug}/${slugVal || "nama-program"}`;

  // Fetch unique slug only when title changes (debounced) and slug hasn't been manually edited
  const { data: generatedSlugData, isFetching: isGeneratingSlug } =
    trpc.programs.getUniqueSlug.useQuery(
      { title: debouncedTitle, excludeId: data.id },
      {
        enabled:
          !!debouncedTitle &&
          debouncedTitle.length >= 3 &&
          !slugManuallyEdited.current,
        staleTime: Infinity,
      },
    );

  // When a new unique slug comes back (only from title change), apply it
  useEffect(() => {
    if (generatedSlugData?.slug && !slugManuallyEdited.current) {
      setValue("slug", generatedSlugData.slug, { shouldDirty: true });
    }
  }, [generatedSlugData, setValue]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // If slug was manually edited, don't auto-update it
    if (slugManuallyEdited.current) return;
    // Optimistically update slug preview while debounce fires
    const val = e.target.value;
    setValue("slug", generateSlug(val), { shouldDirty: true });
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    slugManuallyEdited.current = true;
  }

  function handleRegenerateSlug() {
    slugManuallyEdited.current = false;
    const currentTitle = getValues("title");
    setValue("slug", generateSlug(currentTitle), { shouldDirty: true });
  }

  function handleCopy() {
    navigator.clipboard.writeText(window.location.origin + publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Title + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Judul Program" required error={errors.title?.message}>
          <StyledInput
            {...register("title", {
              onChange: handleTitleChange,
            })}
            placeholder="Contoh: Daily Conversation Intensif"
            error={!!errors.title}
            maxLength={100}
          />
        </FormField>

        <Controller
          name="categoryId"
          control={control}
          render={({ field, fieldState }) => (
            <FormField
              label="Kategori Program"
              required
              error={fieldState.error?.message}
            >
              <SelectInput
                options={categories.map((cat) => ({
                  id: cat.id,
                  label: cat.label,
                  icon: cat.icon ?? undefined,
                }))}
                variant="dropdown"
                value={field.value}
                onChange={(id) => field.onChange(id)}
                placeholder="Pilih kategori program"
                error={!!fieldState.error}
                loading={isLoadingCategories}
              />
            </FormField>
          )}
        />
      </div>

      {/* Slug field */}
      <FormField
        label="Slug URL"
        hint={
          slugManuallyEdited.current
            ? "Slug telah diedit secara manual."
            : "Slug otomatis dibuat dari judul program."
        }
        error={errors.slug?.message}
        required
      >
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm transition-all duration-200 focus-within:border-neutral-300 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]">
          {/* Preview bar */}
          <SlugPreviewBar
            categorySlug={displayCategorySlug}
            slugValue={slugVal}
            isEditingSlug={isEditingSlug}
            onToggleEdit={() => setIsEditingSlug((v) => !v)}
            onCopy={handleCopy}
            copied={copied}
            publicUrl={publicUrl}
          />

          {/* Slug edit panel */}
          <AnimatePresence initial={false}>
            {isEditingSlug && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-3">
                  {/* Input row */}
                  <div className="flex items-stretch rounded-xl border border-neutral-200 overflow-hidden focus-within:border-neutral-400 focus-within:ring-3 focus-within:ring-neutral-100 transition-all duration-200 bg-white">
                    <span className="px-3 py-2.5 text-[12px] font-mono text-neutral-400 bg-neutral-50 border-r border-neutral-200 whitespace-nowrap flex-shrink-0 flex items-center">
                      /programs/{displayCategorySlug}/
                    </span>

                    <input
                      {...register("slug", { onChange: handleSlugChange })}
                      placeholder="nama-program"
                      autoComplete="off"
                      spellCheck={false}
                      className="flex-1 bg-white px-3 py-2.5 text-[13px] font-mono text-neutral-800 placeholder:text-neutral-300 outline-none min-w-0"
                    />

                    {/* Loading / regen indicator */}
                    <div className="flex items-center pr-3">
                      {isGeneratingSlug ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <RefreshCw className="size-3.5 text-neutral-400" />
                        </motion.div>
                      ) : slugManuallyEdited.current ? (
                        <button
                          type="button"
                          onClick={handleRegenerateSlug}
                          title="Buat ulang dari judul"
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-800 font-medium transition-colors"
                        >
                          <Sparkles className="size-3" />
                          Auto
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Warning notice */}
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5"
                  >
                    <AlertTriangle className="size-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] leading-relaxed text-amber-800">
                      Mengubah slug dapat menyebabkan link lama tidak valid jika
                      program sudah pernah dibagikan atau diindeks mesin
                      pencari.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FormField>

      <SectionDivider label="Deskripsi" />

      {/* Short desc */}
      <FormField label="Deskripsi Singkat" error={errors.shortDesc?.message}>
        <StyledTextarea
          {...register("shortDesc")}
          rows={2}
          maxLength={200}
          placeholder="Satu kalimat menarik yang membuat orang ingin mendaftar…"
        />
      </FormField>

      {/* Full desc */}
      <FormField
        label="Deskripsi Lengkap"
        required
        error={errors.description?.message}
        hint="Gunakan format HTML untuk rich text. Editor visual tersedia di tab Konten."
      >
        <StyledTextarea
          {...register("description")}
          rows={5}
          maxLength={2000}
          placeholder="Jelaskan program secara lengkap: tujuan, metode, dan manfaat bagi peserta…"
        />
      </FormField>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IDENTITY SECTION — ROOT
───────────────────────────────────────────────────────────── */

interface IdentitySectionProps {
  data: DetailData;
  programId: string;
}

export function IdentitySection({ data, programId }: IdentitySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();

  const { data: categories = [], isLoading: isLoadingCategories } =
    trpc.programs.getCategories.useQuery();

  const updateIdentity = trpc.programs.updateIdentity.useMutation({
    onSuccess: ({ slug }) => {
      utils.programs.getDetail.invalidate({ id: programId });
      toast.success("Identitas program berhasil disimpan");
      setIsEditing(false);
      // Reset with potentially new slug from server
      form.reset({ ...form.getValues(), slug });
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal menyimpan perubahan");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: data.categoryId,
      title: data.title,
      slug: data.slug,
      shortDesc: data.shortDesc ?? "",
      description: data.description,
    },
  });

  const { isDirty, isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    await updateIdentity.mutateAsync({ id: programId, ...values });
  }

  function handleCancel() {
    form.reset();
    setIsEditing(false);
  }

  return (
    <>
      <SectionCard
        icon={<FileText className="size-4" />}
        title="Identitas Program"
        description="Judul publik, slug URL, kategori, dan deskripsi program."
        isEditing={isEditing}
        isDirty={isDirty}
        isSubmitting={isSubmitting || updateIdentity.isPending}
        onEdit={() => setIsEditing(true)}
        onSave={form.handleSubmit(onSubmit)}
        onCancel={handleCancel}
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <EditMode
                data={data}
                form={form}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
              />
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <ReadMode data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      <AnimatePresence>
        {isEditing && (
          <StickySaveBar
            isDirty={isDirty}
            isSubmitting={isSubmitting || updateIdentity.isPending}
            sectionTitle="Identitas Program"
            onCancel={handleCancel}
            onSave={form.handleSubmit(onSubmit)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
