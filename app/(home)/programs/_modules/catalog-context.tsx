"use client";

// Gives the /programs marketing components the published CMS catalog
// (categories → programs → real prices) instead of hard-coded static data.

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { CategoryMeta } from "../[categorySlug]/data";

type Catalog = {
  /** Categories in display order. */
  list: CategoryMeta[];
  /** Same categories keyed by slug. */
  map: Record<string, CategoryMeta>;
};

const CatalogContext = createContext<Catalog>({ list: [], map: {} });

export function CatalogProvider({
  categories,
  children,
}: {
  categories: CategoryMeta[];
  children: ReactNode;
}) {
  const value = useMemo<Catalog>(
    () => ({
      list: categories,
      map: Object.fromEntries(categories.map((c) => [c.key, c])),
    }),
    [categories],
  );
  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
