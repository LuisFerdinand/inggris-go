// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/content/SectionEditorCard.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import { trpc } from "@/lib/trpc/client";
import type { ProgramSectionInput } from "@/app/modules/program/program-content.schema";

import { SectionCard, StickySaveBar, ReadField } from "../detail";
import { Fields } from "./Fields";
import { SECTION_DEFS, type Field } from "./field-schema";
import { getSectionMeta } from "./registry";

type Obj = Record<string, unknown>;

/**
 * Mirror the exact shape the `updateContentSections` mutation accepts, so the
 * editor's `sections` array stays assignable to the tRPC input (no `as any`).
 */
export type CmsSection = ProgramSectionInput;

interface SectionEditorCardProps {
  programId: string;
  section: CmsSection;
  /** the full current sections array, needed to persist a merged update */
  allSections: CmsSection[];
}

/* ─────────────────────────────────────────────────────────────
   READ SUMMARY (compact)
───────────────────────────────────────────────────────────── */

function fieldSummary(field: Field, value: unknown): string | null {
  if (field.type === "array" || field.type === "stringArray") {
    const n = Array.isArray(value) ? value.length : 0;
    return `${n} ${field.itemNoun.toLowerCase()}`;
  }
  if (field.type === "switch") return value ? "Ya" : "Tidak";
  if (typeof value === "string" && value.trim()) {
    return value.length > 60 ? `${value.slice(0, 60)}…` : value;
  }
  return null;
}

function ReadSummary({
  fields,
  content,
}: {
  fields: Field[];
  content: Obj;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const summary = fieldSummary(field, content?.[field.name]);
        return (
          <ReadField
            key={field.name}
            label={field.label}
            empty={!summary}
            fullWidth={
              field.type === "array" ||
              field.type === "object" ||
              field.type === "stringArray"
            }
          >
            {summary}
          </ReadField>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export function SectionEditorCard({
  programId,
  section,
  allSections,
}: SectionEditorCardProps) {
  const utils = trpc.useUtils();
  const meta = getSectionMeta(section.type);
  const def = SECTION_DEFS[section.type];

  const isRootArray = !!def?.rootArray;
  const fields = isRootArray ? [def!.rootArray!] : def?.fields ?? [];

  // FAQ stores content as a bare array → wrap as { content: [...] } for the editor.
  const initial = useMemo<Obj>(() => {
    if (isRootArray) {
      return {
        content: Array.isArray(section.content) ? section.content : [],
      };
    }
    return (section.content as Obj) ?? {};
  }, [section.content, isRootArray]);

  const initialKey = useRef(JSON.stringify(initial));
  const [draft, setDraft] = useState<Obj>(initial);
  const [isEditing, setIsEditing] = useState(false);

  const isDirty = JSON.stringify(draft) !== initialKey.current;

  const updateSections = trpc.programs.updateContentSections.useMutation();
  const isSubmitting = updateSections.isPending;

  async function handleSave() {
    const nextContent = isRootArray ? draft.content : draft;

    const nextSections = allSections.map((s) =>
      s.id === section.id ? { ...s, content: nextContent } : s,
    );

    const toastId = toast.loading(`Menyimpan ${meta.label}…`);
    try {
      await updateSections.mutateAsync({
        programId,
        sections: nextSections,
      });
      await Promise.all([
        utils.programs.getContent.invalidate({ programId }),
        utils.programs.getOverview.invalidate({ id: programId }),
      ]);
      initialKey.current = JSON.stringify(draft);
      setIsEditing(false);
      toast.success(`${meta.label} disimpan`, { id: toastId });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan perubahan";
      toast.error(message, { id: toastId });
    }
  }

  function handleCancel() {
    setDraft(initial);
    initialKey.current = JSON.stringify(initial);
    setIsEditing(false);
  }

  const Icon = meta.icon;

  return (
    <>
      <SectionCard
        icon={<Icon className="size-4" />}
        title={meta.label}
        description={meta.description}
        isEditing={isEditing}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
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
              <Fields fields={fields} value={draft} onChange={setDraft} />
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ReadSummary fields={fields} content={draft} />
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {isEditing && (
        <StickySaveBar
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          sectionTitle={meta.label}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      )}
    </>
  );
}