import { baseProcedure, createTRPCRouter } from "@/lib/trpc/init";

export const programRouter = createTRPCRouter({
  getAll: baseProcedure.query(() => {
    return [];
  }),
});
