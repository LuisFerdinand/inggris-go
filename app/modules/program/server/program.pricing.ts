// app/modules/program/server/program.pricing.ts
import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { programPackages, programs } from "@/app/db/schema";

/**
 * Keeps `programs.startingPrice` / `startingOriginalPrice` in step with the
 * program's real packages (permanent: direct packages, scheduled: packages of
 * all batches). Packages priced at Rp 0 mean "hubungi admin" and are ignored,
 * so a program with only such packages has no starting price (null).
 */
export async function syncProgramStartingPrice(programId: string) {
  const pkgs = await db.query.programPackages.findMany({
    where: eq(programPackages.programId, programId),
    columns: { price: true, originalPrice: true },
  });

  const cheapest = pkgs
    .filter((p) => p.price > 0)
    .sort((a, b) => a.price - b.price)[0];

  await db
    .update(programs)
    .set({
      startingPrice: cheapest?.price ?? null,
      startingOriginalPrice:
        cheapest?.originalPrice != null && cheapest.originalPrice > cheapest.price
          ? cheapest.originalPrice
          : null,
      updatedAt: new Date(),
    })
    .where(eq(programs.id, programId));
}
