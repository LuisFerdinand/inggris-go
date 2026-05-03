import { userRouter } from "@/app/modules/user/server/user.router";
import { router } from "./trpc";
import { programRouter } from "@/app/modules/program/server/program.router";

export const appRouter = router({
  user: userRouter,
  program: programRouter,
});

export type AppRouter = typeof appRouter;
