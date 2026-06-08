// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/detail/MarketingSection.tsx
"use client";

import { useState, useRef, KeyboardEvent } from "react";
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
  Tag,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
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
   TAG INPUT
───────────────────────────────────────────────────────────── */

const MAX_TAGS = 15;

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
        {/* Suggestions */}
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

        {/* Tag counter */}
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
   LIVE PREVIEW CHIPS (shared by read + edit)
───────────────────────────────────────────────────────────── */

function BadgeChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold ring-1 ring-amber-100 shadow-sm">
      <Award className="size-3 text-amber-500" />
      {label}
    </span>
  );
}

function HighlightChip({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[12px] font-semibold shadow-sm max-w-full">
      <TrendingUp className="size-3.5 text-emerald-500 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   READ MODE
───────────────────────────────────────────────────────────── */

function ReadMode({ data }: { data: DetailData }) {
  const tags = data.tags ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Badge */}
        <ReadField label="Badge" empty={!data.badge}>
          {data.badge ? <BadgeChip label={data.badge} /> : null}
        </ReadField>

        {/* Highlight */}
        <ReadField label="Highlight" empty={!data.highlight}>
          {data.highlight ? <HighlightChip label={data.highlight} /> : null}
        </ReadField>
      </div>

      {/* Tags */}
      <ReadField label="Tags" empty={tags.length === 0}>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 pl-2 pr-2.5 py-0.5 rounded-full bg-neutral-50 border border-neutral-200 text-[11px] font-semibold text-neutral-700"
              >
                <Hash className="size-2.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </ReadField>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EDIT MODE
───────────────────────────────────────────────────────────── */

function EditMode({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;
  const badgeVal = watch("badge");
  const highlightVal = watch("highlight");

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Badge */}
        <FieldWrap
          label="Badge"
          hint='Contoh: "Bestseller", "Baru", "Hot"'
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

            {/* Live badge preview */}
            <AnimatePresence>
              {badgeVal && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] text-neutral-400 font-medium flex-shrink-0">
                      Preview:
                    </span>
                    <BadgeChip label={badgeVal} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FieldWrap>

        {/* Highlight */}
        <FieldWrap
          label="Highlight"
          hint="Kalimat singkat di kartu program"
          error={errors.highlight?.message}
        >
          <div className="flex flex-col gap-2">
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-emerald-400 pointer-events-none" />
              <input
                {...register("highlight")}
                placeholder="Sertifikat termasuk"
                maxLength={80}
                className={cn(inputCls, "pl-9")}
              />
            </div>

            {/* Live highlight preview */}
            <AnimatePresence>
              {highlightVal && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] text-neutral-400 font-medium flex-shrink-0">
                      Preview:
                    </span>
                    <HighlightChip label={highlightVal} />
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
        hint="Tekan Enter, koma, atau spasi untuk menambah. Klik saran untuk cepat."
        error={
          Array.isArray(errors.tags) ? "Tags tidak valid" : errors.tags?.message
        }
      >
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} />
          )}
        />
      </FieldWrap>

      <InfoNotice icon={<Sparkles className="size-3.5" />} variant="info">
        Tags membantu program ditemukan di pencarian dan filter katalog.
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

  const updateMarketing = trpc.programs.updateMarketing.useMutation({
    onSuccess: () => {
      utils.programs.getDetail.invalidate({ id: programId });
      toast.success("Marketing metadata berhasil disimpan");
      setIsEditing(false);
      form.reset(form.getValues());
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal menyimpan perubahan");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      badge: data.badge ?? "",
      highlight: data.highlight ?? "",
      tags: data.tags ?? [],
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
              <EditMode form={form} />
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
