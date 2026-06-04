// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/content/index.ts
export { default as ContentTab } from "../ContentTab";
export { SectionEditorCard, type CmsSection } from "./SectionEditorCard";
export { Fields } from "./Fields";
export { SECTION_META, getSectionMeta, type SectionMeta } from "./registry";
export {
  SECTION_DEFS,
  type Field,
  type SectionDef,
  defaultForFields,
} from "./field-schema";