// app/(home)/programs/page.tsx
import { HydrateClient } from "@/lib/trpc/server";
import ProgramsView from "./_modules/ui/views/ProgramsView";
import { CatalogProvider } from "./_modules/catalog-context";
import { dbCategoryToMeta, getPublicCaller } from "./[categorySlug]/_adapters";

export const dynamic = "force-dynamic";

// Display order of the known categories; anything else follows alphabetically.
const CATEGORY_ORDER = ["lead", "online", "offline"];

const ProgramsPage = async () => {
  const caller = await getPublicCaller();
  const menu = await caller.publicPrograms.menu();

  const categories = await Promise.all(
    menu.map(async (m) => {
      const [category, programs] = await Promise.all([
        caller.publicPrograms.categoryBySlug({ slug: m.slug }),
        caller.publicPrograms.programsByCategory({ categorySlug: m.slug }),
      ]);
      return category
        ? dbCategoryToMeta(category, programs as any, m.slug)
        : null;
    }),
  );

  const rank = (key: string) => {
    const i = CATEGORY_ORDER.indexOf(key);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  const sorted = categories
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => rank(a.key) - rank(b.key) || a.key.localeCompare(b.key));

  return (
    <HydrateClient>
      <CatalogProvider categories={sorted}>
        <ProgramsView />
      </CatalogProvider>
    </HydrateClient>
  );
};

export default ProgramsPage;
