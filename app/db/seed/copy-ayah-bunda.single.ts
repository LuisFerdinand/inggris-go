// app/db/seed/copy-ayah-bunda.single.ts
//
// One-off copy fix for text that lives in the DATABASE (program categories),
// not in code: "kamu / -mu" → "Ayah/Bunda" on the /programs page.
//
// The code-side copy is already updated (data.ts is the seed source), but the
// rows already in the database keep the old wording until they are edited.
// This script rewrites ONLY the exact phrases listed below, inside the
// category rows — nothing else is touched, nothing is deleted.
//
//   npm run db:fix:copy-ayah-bunda            → dry run, shows what would change
//   npm run db:fix:copy-ayah-bunda -- --apply → writes the changes
//
// DO NOT use `npm run db:seed` for this: seedCategories() deletes every
// category first (and programs cascade with them).

import "./load-env";

import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { programCategories } from "@/app/db/schema";

const REPLACEMENTS: [from: string, to: string][] = [
  [
    "Kamu selalu tahu posisi dan progress-mu.",
    "Ayah/Bunda selalu tahu posisi dan progress belajar anak.",
  ],
  [
    "Pilih kelas yang sesuai dengan level dan tujuanmu",
    "Pilih kelas yang sesuai dengan level dan tujuan belajar anak",
  ],
  [
    "rekomendasikan program yang paling pas untuk level dan tujuanmu.",
    "rekomendasikan program yang paling pas untuk level dan tujuan belajar anak.",
  ],
];

// Columns of program_categories that hold public copy.
const COLUMNS = [
  "tagline",
  "taglineAccent",
  "description",
  "forWho",
  "painPoints",
  "benefits",
  "steps",
  "experience",
  "comparison",
  "socialProof",
  "cta",
  "emptyState",
  "quickDecisionLabel",
  "quickDecisionDesc",
] as const;

function rewrite(value: unknown): { next: unknown; hits: string[] } {
  if (value == null) return { next: value, hits: [] };

  let json = JSON.stringify(value);
  const hits: string[] = [];

  for (const [from, to] of REPLACEMENTS) {
    if (json.includes(from)) {
      json = json.split(from).join(to);
      hits.push(from);
    }
  }

  return { next: hits.length ? JSON.parse(json) : value, hits };
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(apply ? "✏️  APPLY mode\n" : "👀 Dry run (add --apply to write)\n");

  const rows = await db.select().from(programCategories);
  let changedRows = 0;

  for (const row of rows) {
    const patch: Record<string, unknown> = {};
    const hits: string[] = [];

    for (const column of COLUMNS) {
      const { next, hits: columnHits } = rewrite(row[column]);
      if (columnHits.length) {
        patch[column] = next;
        hits.push(...columnHits.map((h) => `${column}: "${h}"`));
      }
    }

    if (hits.length === 0) continue;

    changedRows++;
    console.log(`• ${row.slug}`);
    for (const hit of hits) console.log(`    ${hit}`);

    if (apply) {
      await db
        .update(programCategories)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(programCategories.id, row.id));
    }
  }

  console.log(
    changedRows === 0
      ? "\nNothing to change — copy is already up to date."
      : `\n${apply ? "Updated" : "Would update"} ${changedRows} categor${changedRows === 1 ? "y" : "ies"}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
