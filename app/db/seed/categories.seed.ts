import { CATEGORIES } from "@/app/(home)/programs/[category]/data";
import { db } from "../db";
import { programCategories } from "../schema";

type CategoryInsert = typeof programCategories.$inferInsert;
export async function seedCategories() {
  console.log("1. Seeding Program Categories...");
  for (const key in CATEGORIES) {
    const cat = CATEGORIES[key];
    const data: CategoryInsert = {
      id: `cat-${cat.key}`,
      key: cat.key,
      slug: cat.href.replace(/\/+$/, "").split("/").pop()!,

      label: cat.label,
      shortLabel: cat.shortLabel,
      order: 0,
      status: "published" as CategoryInsert["status"],

      icon: cat.icon,
      heroImage: cat.heroImage,

      tagline: cat.tagline,
      taglineAccent: cat.taglineAccent,
      description: cat.description,
      forWho: cat.forWho,

      themePrimary: cat.theme.primary,

      // ✅ JSON fields
      painPoints: cat.painPoints ?? [],
      benefits: cat.benefits ?? [],
      steps: cat.steps ?? [],
      experience: cat.experience ?? [],
      comparison: cat.comparison ?? [],
      socialProof: cat.socialProof ?? [],
      cta: cat.cta ?? null,

      emptyState: {
        title: "Belum ada program tersedia",
        description: "Silakan cek kembali nanti atau hubungi admin.",
      },

      quickDecisionLabel: cat.quickDecisionLabel,
      quickDecisionDesc: cat.quickDecisionDesc,

      updatedAt: new Date(),
    };

    await db
      .insert(programCategories)
      .values(data)
      .onConflictDoUpdate({
        target: programCategories.id,
        set: {
          key: data.key,
          slug: data.slug,
          label: data.label,
          shortLabel: data.shortLabel,
          order: data.order ?? 0,
          status: data.status,
          icon: data.icon,
          heroImage: data.heroImage,
          tagline: data.tagline,
          taglineAccent: data.taglineAccent,
          description: data.description,
          forWho: data.forWho,
          themePrimary: data.themePrimary,
          painPoints: data.painPoints,
          benefits: data.benefits,
          steps: data.steps,
          experience: data.experience,
          comparison: data.comparison,
          socialProof: data.socialProof,
          cta: data.cta,
          emptyState: data.emptyState,
          quickDecisionLabel: data.quickDecisionLabel,
          quickDecisionDesc: data.quickDecisionDesc,
          updatedAt: new Date(),
        },
      });
  }
}
