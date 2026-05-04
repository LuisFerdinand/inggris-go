import { baseProcedure, createTRPCRouter } from "@/lib/trpc/init";

export const userRouter = createTRPCRouter({
  getAll: baseProcedure.query(() => {
    return [];
  }),
});
