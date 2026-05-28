"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Info,
  CheckCircle2,
  Sparkles,
  ImageOff,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";
import { uploadFiles } from "@/lib/uploadthing/client";
import { useImageUpload } from "@/components/file-uploader/useImageUpload";
import { ImageUploadField } from "@/components/file-uploader/ImageUploadField";
import {
  DetailData,
  FieldWrap,
  InfoNotice,
  ReadField,
  SectionCard,
  StickySaveBar,
} from ".";
import { Icon } from "@/components/Icon";
import { IconPicker } from "@/components/Form";

/* ─────────────────────────────────────────────────────────────
   SCHEMA
───────────────────────────────────────────────────────────── */

const schema = z.object({
  icon: z.string().nullable().optional(),
  // thumbnailUrl is display-only state — not submitted via this form.
  // The actual URL comes from UploadThing's onUploadComplete writing to DB.
  // We track a local "cleared" flag to know when to call removeThumbnail.
  thumbnailCleared: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─────────────────────────────────────────────────────────────
   READ MODE
───────────────────────────────────────────────────────────── */

function ReadMode({ data }: { data: DetailData }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Thumbnail preview */}
      <div className="flex-shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.7px] text-neutral-400 mb-2.5">
          Thumbnail
        </p>
        <div className="w-[120px] aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50">
          {data.thumbnailUrl ? (
            <img
              src={data.thumbnailUrl}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="size-8 rounded-xl bg-neutral-200/60 flex items-center justify-center">
                <ImageOff className="size-4 text-neutral-400" />
              </div>
              <span className="text-[10px] text-neutral-400 font-medium text-center px-2">
                Belum ada thumbnail
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-4 flex-1">
        <ReadField label="Status Thumbnail">
          {data.thumbnailUrl ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Thumbnail tersedia
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
              <ImageOff className="size-3.5" />
              Belum ada thumbnail
            </span>
          )}
        </ReadField>

        <ReadField label="Icon Program" empty={!data.icon}>
          {data.icon ? (
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon name={data.icon} className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-neutral-800">
                  {data.icon}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Identitas visual program
                </span>
              </div>
            </div>
          ) : null}
        </ReadField>

        {!data.thumbnailUrl && (
          <InfoNotice icon={<Info className="size-3.5" />} variant="warn">
            Thumbnail belum diunggah. Program tanpa thumbnail akan kurang
            menarik di katalog.
          </InfoNotice>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EDIT MODE
───────────────────────────────────────────────────────────── */

interface EditModeProps {
  form: ReturnType<typeof useForm<FormValues>>;
  imageUpload: ReturnType<typeof useImageUpload>;
  currentThumbnailUrl: string | null | undefined;
  isSubmitting: boolean;
  onThumbnailRemove: () => void;
}

function EditMode({
  form,
  imageUpload,
  currentThumbnailUrl,
  isSubmitting,
  onThumbnailRemove,
}: EditModeProps) {
  const { control } = form;

  // What the user sees as the "current" image:
  // - If they picked a new local file → show previewUrl
  // - If they haven't picked anything → show whatever's already in the DB
  // - If they cleared it → show nothing (imageUpload.previewUrl is null AND thumbnailCleared is true)
  const displayUrl = imageUpload.previewUrl ?? currentThumbnailUrl;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Thumbnail upload */}
        <div className="flex-shrink-0">
          <FieldWrap
            label="Thumbnail Program"
            hint="Rasio ideal 3:4 · Maks 4MB · JPG, PNG, WebP"
          >
            <ImageUploadField
              value={displayUrl}
              onChange={imageUpload.handleFileSelect}
              onRemove={() => {
                imageUpload.removeFile();
                onThumbnailRemove();
              }}
              disabled={isSubmitting}
              label=""
              hint="Rekomendasi rasio 3:4 untuk kualitas terbaik"
              description="JPG, PNG, WebP"
              maxSizeLabel="Maks 4MB"
              aspectRatioPresets={["4/3", "3/2", "1/1"]}
              error={imageUpload.error}
            />
          </FieldWrap>
        </div>

        {/* Icon picker */}
        <div className="flex flex-col gap-4 flex-1">
          <FieldWrap
            label="Icon Program"
            hint="Digunakan pada katalog, card program, dan navigasi."
          >
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  {/* Preview */}
                  <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                      <Icon name={field.value} className="size-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-neutral-800">
                        {field.value || "Belum memilih icon"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        Pilih icon yang merepresentasikan program secara visual.
                      </p>
                    </div>
                  </div>

                  {/* Picker */}
                  <IconPicker
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    placeholder="Pilih icon program"
                  />
                </div>
              )}
            />
          </FieldWrap>

          <InfoNotice icon={<Sparkles className="size-3.5" />} variant="info">
            Gunakan icon sederhana dan mudah dikenali agar program lebih cepat
            diidentifikasi pengguna.
          </InfoNotice>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BRANDING SECTION — ROOT
───────────────────────────────────────────────────────────── */

interface BrandingSectionProps {
  data: DetailData;
  programId: string;
}

export function BrandingSection({ data, programId }: BrandingSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();

  // Tracks whether the user explicitly removed the existing DB thumbnail
  // during this edit session (without uploading a replacement).
  const [thumbnailCleared, setThumbnailCleared] = useState(false);

  const imageUpload = useImageUpload({ maxSizeMB: 4 });

  const updateBranding = trpc.programs.updateBranding.useMutation();
  const removeThumbnail = trpc.programs.removeThumbnail.useMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      icon: data.icon,
      thumbnailCleared: false,
    },
  });

  const { isDirty, isSubmitting } = form.formState;

  // isDirty only tracks form fields (icon). We also need to know if the
  // image selection state changed so the Save bar appears correctly.
  const hasImageChange = !!imageUpload.file || thumbnailCleared;
  const canSave = isDirty || hasImageChange;

  async function onSubmit(values: FormValues) {
    console.log("ProgramId before: ", programId);
    const toastId = toast.loading("Menyimpan branding…");

    try {
      // ── 1. Remove thumbnail if user cleared it and didn't upload a new one ──
      if (thumbnailCleared && !imageUpload.file) {
        await removeThumbnail.mutateAsync({ id: programId });
      }

      // ── 2. Upload new thumbnail if a file was selected ──────────────────────
      // UploadThing's onUploadComplete already writes thumbnailUrl + thumbnailKey
      // to the DB, so we don't need to do anything else for the thumbnail here.
      if (imageUpload.file) {
        toast.loading("Uploading thumbnail...", { id: toastId });
        const res = await uploadFiles("programThumbnailUploader", {
          files: [imageUpload.file],
          input: { programId },
        });
        console.log({ res });
        if (!res?.[0]?.serverData?.url) {
          throw new Error("Gagal mengunggah thumbnail");
        }
        if (!res?.[0]) {
          throw new Error("Gagal mengunggah thumbnail");
        }
      }

      // ── 3. Save icon (only field managed by the form) ────────────────────────
      // Always call this — even if icon didn't change — so updatedAt is bumped.
      // Or guard with `if (isDirty)` if you prefer fewer round-trips.
      const res2 = await updateBranding.mutateAsync({
        id: programId,
        icon: values.icon ?? null,
      });
      console.log("Result2: ");
      console.log(res2);

      // ── 4. Refresh detail query ──────────────────────────────────────────────
      await utils.programs.getDetail.invalidate({ id: programId });

      toast.success("Branding berhasil disimpan", { id: toastId });
      setIsEditing(false);
      setThumbnailCleared(false);
      imageUpload.removeFile();
      form.reset(values);
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menyimpan perubahan", { id: toastId });
    }
  }

  function handleCancel() {
    form.reset();
    imageUpload.removeFile();
    setThumbnailCleared(false);
    setIsEditing(false);
  }

  function handleThumbnailRemove() {
    // Mark that the user wants to clear the existing DB thumbnail.
    // The actual DB/UploadThing delete happens on Save.
    setThumbnailCleared(true);
  }

  return (
    <>
      <SectionCard
        icon={<ImageIcon className="size-4" />}
        title="Branding & Visual"
        description="Thumbnail dan identitas visual program di katalog dan halaman publik."
        isEditing={isEditing}
        isDirty={canSave}
        isSubmitting={isSubmitting}
        onEdit={() => setIsEditing(true)}
        onSave={form.handleSubmit(onSubmit)}
        onCancel={handleCancel}
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <EditMode
                form={form}
                imageUpload={imageUpload}
                currentThumbnailUrl={
                  thumbnailCleared ? null : data.thumbnailUrl
                }
                isSubmitting={isSubmitting}
                onThumbnailRemove={handleThumbnailRemove}
              />
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ReadMode data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {isEditing && (
        <StickySaveBar
          isDirty={canSave}
          isSubmitting={isSubmitting}
          sectionTitle="Branding & Visual"
          onCancel={handleCancel}
          onSave={form.handleSubmit(onSubmit)}
        />
      )}
    </>
  );
}
