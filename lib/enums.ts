export const PROGRAM_STATUS = ["draft", "published", "archived"] as const;
export type ProgramStatus = (typeof PROGRAM_STATUS)[number];

export const PROGRAM_CATEGORY_STATUS = [
  "draft",
  "published",
  "archived",
] as const;
export type ProgramCategoryStatus = (typeof PROGRAM_CATEGORY_STATUS)[number];
