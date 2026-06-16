// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/detail/MarketingSection.tsx
"use client";

import { useState, useRef, KeyboardEvent, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Award,
  TrendingUp,
  Hash,
  X,
  Sparkles,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";
import { cn, generateTheme } from "@/lib/utils";

import {
  SectionCard,
  ReadField,
  FieldWrap,
  StickySaveBar,
  InfoNotice,
  inputCls,
  type DetailData,
} from ".";

/* ─────────────────────────────────────────────────────────────
   SCHEMA
───────────────────────────────────────────────────────────── */

const schema = z.object({
  badge: z.string().max(30).optional().or(z.literal("")),
  highlight: z.string().max(80).optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(15),
});

type FormValues = z.infer<typeof schema>;

/* ─────────────────────────────────────────────────────────────
   CONSTANTS / HELPERS
───────────────────────────────────────────────────────────── */

const MAX_TAGS = 15;
const HIGHLIGHT_SEPARATOR = "|";

type Theme = ReturnType<typeof generateTheme>;

function splitProgramHighlight(highlight: string | null | undefined) {
  if (!highlight) return [];

  // Backward compatible:
  // New format: "A | B | C"
  // Old format: "A • B • C"
  const separator = highlight.includes(HIGHLIGHT_SEPARATOR)
    ? HIGHLIGHT_SEPARATOR
    : "•";

  return highlight
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

// Common suggested tags users can click to add instantly
const SUGGESTED_TAGS = [
  "intensif",
  "sertifikat",
  "online",
  "offline",
  "beginner",
  "grammar",
  "speaking",
  "toefl",
  "ielts",
  "bisnis",
];

/* ─────────────────────────────────────────────────────────────
   PUBLIC CARD STYLE PREVIEWS
   These match the public ProgramCard visual treatment.
───────────────────────────────────────────────────────────── */

function PublicCardBadgePreview({
  badge,
  theme,
}: {
  badge: string;
  theme: Theme;
}) {
  return (
    <span
      className="inline-flex items-center rounded-[6px] px-2 py-0.5 font-display font-bold"
      style={{
        fontSize: "0.5625rem",
        background: theme.primary,
        color: "white",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {badge}
    </span>
  );
}

function PublicCardHighlightPreview({
  highlight,
  theme,
}: {
  highlight: string;
  theme: Theme;
}) {
  const highlightItems = splitProgramHighlight(highlight);
  const isMultiHighlight = highlightItems.length > 1;

  return (
    <div
      className="w-full rounded-xl p-3"
      style={{
        background: "var(--surface-soft)",
        border: "1px solid var(--border-soft)",
      }}
    >
      {isMultiHighlight ? (
        <div className="flex flex-wrap gap-1.5">
          {highlightItems.map((text, i) => (
            <span
              key={`${text}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-display font-semibold"
              style={{
                fontSize: "0.625rem",
                background: theme.soft,
                color: theme.primary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <svg
                viewBox="0 0 10 10"
                className="h-2 w-2 flex-shrink-0"
                fill="none"
              >
                <path
                  d="M2 5l2 2 4-4"
                  stroke={theme.primary}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {text}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex items-start gap-2.5">
          <div
            className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: theme.soft }}
          >
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none">
              <path
                d="M2 5l2 2 4-4"
                stroke={theme.primary}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              lineHeight: "1.55",
            }}
          >
            {highlightItems[0] ?? highlight}
          </p>
        </div>
      )}
    </div>
  );
}

function PublicCardTagsPreview({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, 4).map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="rounded-full px-2 py-0.5"
          style={{
            fontSize: "0.5875rem",
            background: "var(--surface-soft)",
            color: "var(--text-faint)",
            border: "1px solid var(--border-soft)",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAG INPUT
───────────────────────────────────────────────────────────── */

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

function TagInput({ value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_TAGS - value.length;
  const canAdd = remaining > 0;

  function sanitize(raw: string) {
    return raw
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function addTag(raw: string) {
    const tag = sanitize(raw);

    if (tag && !value.includes(tag) && canAdd) {
      onChange([...value, tag]);
      setInputValue("");
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  const suggestions = SUGGESTED_TAGS.filter(
    (s) => !value.includes(s) && s.includes(inputValue.toLowerCase()),
  ).slice(0, 5);

  return (
    <div className="flex flex-col gap-2">
      {/* Input area */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "min-h-[48px] flex flex-wrap items-center gap-1.5 px-2.5 py-2 rounded-xl border bg-white transition-all duration-150 cursor-text",
          focused
            ? "border-neutral-400 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
            : "border-neutral-200 hover:border-neutral-300",
        )}
      >
        <AnimatePresence initial={false}>
          {value.map((tag) => (
            <motion.span
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.13, ease: "easeOut" }}
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-neutral-50 border border-neutral-200 text-[11px] font-semibold text-neutral-700 select-none"
            >
              <Hash className="size-2.5 opacity-60" />
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="ml-0.5 size-4 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors"
              >
                <X className="size-2.5" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {canAdd && (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (inputValue) addTag(inputValue);
            }}
            placeholder={
              value.length === 0 ? "Ketik tag lalu Enter atau koma…" : ""
            }
            className="flex-1 min-w-[120px] outline-none text-[12px] text-neutral-700 placeholder:text-neutral-300 bg-transparent py-0.5"
          />
        )}
      </div>

      {/* Footer row: suggestions + counter */}
      <div className="flex items-start justify-between gap-3 min-h-[22px]">
        <AnimatePresence>
          {focused && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 flex-wrap"
            >
              <span className="text-[10px] text-neutral-400 font-medium">
                Saran:
              </span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTag(s)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-neutral-50 hover:border-neutral-200 hover:text-neutral-700 text-[11px] text-neutral-500 font-medium transition-colors duration-100"
                >
                  <Hash className="size-2.5" />
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <span
          className={cn(
            "text-[10px] font-semibold tabular-nums ml-auto whitespace-nowrap flex-shrink-0",
            remaining === 0 ? "text-amber-500" : "text-neutral-400",
          )}
        >
          {value.length}/{MAX_TAGS}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   READ MODE
───────────────────────────────────────────────────────────── */

function ReadMode({ data, theme }: { data: DetailData; theme: Theme }) {
  const tags = data.tags ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Badge */}
        <ReadField label="Badge" empty={!data.badge}>
          {data.badge ? (
            <PublicCardBadgePreview badge={data.badge} theme={theme} />
          ) : null}
        </ReadField>

        {/* Highlight */}
        <ReadField label="Highlight" empty={!data.highlight}>
          {data.highlight ? (
            <PublicCardHighlightPreview
              highlight={data.highlight}
              theme={theme}
            />
          ) : null}
        </ReadField>
      </div>

      {/* Tags */}
      <ReadField label="Tags" empty={tags.length === 0}>
        <PublicCardTagsPreview tags={tags} />
      </ReadField>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EDIT MODE
───────────────────────────────────────────────────────────── */

function EditMode({
  form,
  theme,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  theme: Theme;
}) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const badgeVal = watch("badge");
  const highlightVal = watch("highlight");
  const tagsVal = watch("tags") ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Badge */}
        <FieldWrap
          label="Badge"
          hint='Contoh: "Bestseller", "Baru", "Hot". Preview mengikuti badge kartu publik.'
          error={errors.badge?.message}
        >
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-amber-400 pointer-events-none" />
              <input
                {...register("badge")}
                placeholder="Bestseller"
                maxLength={30}
                className={cn(inputCls, "pl-9")}
              />
            </div>

            <AnimatePresence>
              {badgeVal && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Preview kartu publik:
                    </span>
                    <div>
                      <PublicCardBadgePreview
                        badge={badgeVal}
                        theme={theme}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FieldWrap>

        {/* Highlight */}
        <FieldWrap
          label="Highlight"
          hint='Pisahkan beberapa highlight dengan tanda "|". Contoh: Sertifikat termasuk | Mentor aktif | Grup belajar'
          error={errors.highlight?.message}
        >
          <div className="flex flex-col gap-2">
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-emerald-400 pointer-events-none" />
              <input
                {...register("highlight")}
                placeholder="Sertifikat termasuk | Mentor aktif | Grup belajar"
                maxLength={80}
                className={cn(inputCls, "pl-9")}
              />
            </div>

            <AnimatePresence>
              {highlightVal && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Preview kartu publik:
                    </span>

                    <PublicCardHighlightPreview
                      highlight={highlightVal}
                      theme={theme}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FieldWrap>
      </div>

      {/* Tags */}
      <FieldWrap
        label="Tags"
        hint="Tekan Enter, koma, atau spasi untuk menambah. Preview mengikuti tampilan tags kartu publik."
        error={
          Array.isArray(errors.tags) ? "Tags tidak valid" : errors.tags?.message
        }
      >
        <div className="flex flex-col gap-2">
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput value={field.value} onChange={field.onChange} />
            )}
          />

          <AnimatePresence>
            {tagsVal.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Preview kartu publik:
                  </span>

                  <PublicCardTagsPreview tags={tagsVal} />

                  {tagsVal.length > 4 && (
                    <p className="text-[10px] text-neutral-400">
                      Kartu publik hanya menampilkan 4 tag pertama.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FieldWrap>

      <InfoNotice icon={<Sparkles className="size-3.5" />} variant="info">
        Badge, highlight, dan tags di atas akan tampil di kartu program publik.
      </InfoNotice>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MARKETING SECTION — ROOT
───────────────────────────────────────────────────────────── */

interface MarketingSectionProps {
  data: DetailData;
  programId: string;
}

export function MarketingSection({ data, programId }: MarketingSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();

  const theme = useMemo(
    () => generateTheme(data.category.themePrimary),
    [data.category.themePrimary],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      badge: data.badge ?? "",
      highlight: data.highlight ?? "",
      tags: data.tags ?? [],
    },
  });

  const updateMarketing = trpc.programs.updateMarketing.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.programs.getDetail.invalidate({ id: programId }),
        utils.programs.getFiltered.invalidate(),
      ]);

      toast.success("Marketing metadata berhasil disimpan");
      setIsEditing(false);
      form.reset(form.getValues());
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal menyimpan perubahan");
    },
  });

  const { isDirty, isSubmitting } = form.formState;
  const isPending = isSubmitting || updateMarketing.isPending;

  async function onSubmit(values: FormValues) {
    await updateMarketing.mutateAsync({ id: programId, ...values });
  }

  function handleCancel() {
    form.reset();
    setIsEditing(false);
  }

  return (
    <>
      <SectionCard
        icon={<Megaphone className="size-4" />}
        title="Marketing Metadata"
        description="Badge, highlight, dan tags untuk visibilitas dan konversi."
        isEditing={isEditing}
        isDirty={isDirty}
        isSubmitting={isPending}
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
              <EditMode form={form} theme={theme} />
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <ReadMode data={data} theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      <AnimatePresence>
        {isEditing && (
          <StickySaveBar
            isDirty={isDirty}
            isSubmitting={isPending}
            sectionTitle="Marketing Metadata"
            onCancel={handleCancel}
            onSave={form.handleSubmit(onSubmit)}
          />
        )}
      </AnimatePresence>
    </>
  );
}