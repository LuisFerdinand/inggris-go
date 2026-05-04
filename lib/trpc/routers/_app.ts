import { userRouter } from "@/app/modules/user/server/user.router";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  users: userRouter,
});
export type AppRouter = typeof appRouter;
