// lib/trpc/routers/_app.ts
import { userRouter } from "@/app/modules/user/server/user.router";
import { createTRPCRouter } from "../init";
import { programRouter } from "@/app/modules/program/server/program.router";
import { batchRouter } from "@/app/modules/program/server/batch.router";
import { packageRouter } from "@/app/modules/program/server/package.router";
import { categoryRouter } from "@/app/modules/program/server/category.router";
import { orderRouter } from "@/app/modules/order/server/order.router";
import { programPublicRouter } from "@/app/modules/program/server/program.public.router";
import { blogRouter } from "@/app/modules/blog/server/blog.router";
import { siteHeaderRouter } from "@/app/modules/site-header/server/site-header.router";
import { footerRouter } from "@/app/modules/footer/server/footer.router";
import { classRouter } from "@/app/modules/class/server/class.router";
import { sessionRouter } from "@/app/modules/class/server/session.router";
import { scoreRouter } from "@/app/modules/class/server/score.router";
import { taskBoardRouter } from "@/app/modules/task-board/server/task-board.router";

export const appRouter = createTRPCRouter({
  users: userRouter,
  programs: programRouter,
  batches: batchRouter,
  packages: packageRouter,
  categories: categoryRouter,
  orders: orderRouter,
  publicPrograms: programPublicRouter,
  blog: blogRouter,
  siteHeader: siteHeaderRouter,
  footer: footerRouter,
  classes: classRouter,
  classSessions: sessionRouter,
  classScores: scoreRouter,
  taskBoard: taskBoardRouter,
});

export type AppRouter = typeof appRouter;