import { publicProcedure, router } from "@/app/server/api/trpc";

export const userRouter = router({
  getAll: publicProcedure.query(() => {
    return [];
  }),
});
