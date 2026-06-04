// lib/trpc/routers/_app.ts
import { userRouter } from "@/app/modules/user/server/user.router";
import { createTRPCRouter } from "../init";
import { programRouter } from "@/app/modules/program/server/program.router";
import { orderRouter } from "@/app/modules/order/server/order.router";

export const appRouter = createTRPCRouter({
  users: userRouter,
  programs: programRouter,
  orders: orderRouter,
});
export type AppRouter = typeof appRouter;
