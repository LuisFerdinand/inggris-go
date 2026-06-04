// app/modules/program/program-content.schema.ts
import { z } from "zod";

/* ─────────────────────────────────────────────────────────────
   THEME
───────────────────────────────────────────────────────────── */

export const programThemeSchema = z
  .object({
    primary: z.string().optional(),
    accent: z.string().optional(),
    background: z.string().optional(),
    foreground: z.string().optional(),
    gradient: z
      .object({
        from: z.string(),
        to: z.string(),
      })
      .optional(),
  })
  .partial()
  .optional();

/* ─────────────────────────────────────────────────────────────
   SECTION
   ───────────────────────────────────────────────────────────────
   `content` stays intentionally flexible (z.unknown) so the JSON
   shape per type can evolve without DB migrations, and so existing
   rows are never rejected. The id/type/visible envelope IS validated.
───────────────────────────────────────────────────────────── */

export const programSectionSchema = z
  .object({
    id: z.string().min(1, "ID section wajib diisi"),
    type: z.string().min(1), 
    visible: z.boolean().default(true),
    theme: z
      .object({
        variant: z.enum(["light", "dark", "primary", "accent"]).optional(),
        background: z.string().optional(),
      })
      .optional(),
    content: z.unknown(),
  })
  .passthrough();

export type ProgramSectionInput = z.infer<typeof programSectionSchema>;

/* ─────────────────────────────────────────────────────────────
   MUTATION INPUTS
───────────────────────────────────────────────────────────── */

export const updateProgramContentSchema = z.object({
  programId: z.string().min(1),
  theme: programThemeSchema.nullable().optional(),
  isPublished: z.boolean().optional(),
  sections: z.array(programSectionSchema).default([]),
});

// Used by the `updateContentSections` mutation (replaces z.array(z.any())).
export const updateContentSectionsSchema = z.object({
  programId: z.string().min(1),
  sections: z.array(programSectionSchema).default([]),
});

export const toggleProgramSectionSchema = z.object({
  programId: z.string().min(1),
  sectionId: z.string().min(1),
  visible: z.boolean(),
});

// NEW — delete a section from the sections array.
export const removeContentSectionSchema = z.object({
  programId: z.string().min(1),
  sectionId: z.string().min(1),
});

export type UpdateProgramContentValues = z.infer<
  typeof updateProgramContentSchema
>;