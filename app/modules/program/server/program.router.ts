import { publicProcedure, router } from "@/app/server/api/trpc";

export const programRouter = router({
  getAll: publicProcedure.query(() => {
    return [];
  }),
});
