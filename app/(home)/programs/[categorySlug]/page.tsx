// app/(home)/programs/[categorySlug]/page.tsx
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Category pages no longer exist: visitors open a program's own page
 * (/programs/<category>/<program>) straight from the Beranda showcase or the
 * /programs catalog. Old category links land on the catalog.
 */
export default function CategoryPage() {
  permanentRedirect("/programs");
}
