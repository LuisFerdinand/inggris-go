import { db } from "@/app/db/db";
import { programCategories } from "@/app/db/schema";
import { baseProcedure, createTRPCRouter } from "@/lib/trpc/init";
import { asc } from "drizzle-orm";

export const programRouter = createTRPCRouter({
  getAll: baseProcedure.query(() => {
    return [];
  }),
  getCategories: baseProcedure.query(async () => {
    const categories = await db
      .select()
      .from(programCategories)
      .orderBy(asc(programCategories.label));
    return categories;
  }),
});
