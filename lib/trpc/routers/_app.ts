import { userRouter } from "@/app/modules/user/server/user.router";
import { createTRPCRouter } from "../init";
import { programRouter } from "@/app/modules/program/server/program.router";

export const appRouter = createTRPCRouter({
  users: userRouter,
  programs: programRouter,
});
export type AppRouter = typeof appRouter;
