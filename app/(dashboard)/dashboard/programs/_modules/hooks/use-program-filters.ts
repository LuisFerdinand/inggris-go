// app/(dashboard)/dashboard/programs/_modules/hooks/use-program-filters.ts
"use client";

import { parseAsString, useQueryStates } from "nuqs";

/**
 * URL-synced filter state for the programs dashboard.
 * Each value is `string | null`. Setting `null` clears it from the URL.
 */
export function useProgramFilters() {
  return useQueryStates(
    {
      status: parseAsString,
      categoryId: parseAsString,
      format: parseAsString,
      level: parseAsString,
      scheduleType: parseAsString,
      registrationType: parseAsString,
      searchQuery: parseAsString,
    },
    { clearOnDefault: true },
  );
}