// lib/trpc/init.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { auth } from "@/lib/auth";

export const createTRPCContext = async () => {
  // NextAuth's `auth()` reads the session from cookies/headers itself.
  // No headers argument and no `.api.getSession` (that was Better Auth).
  const session = await auth();

  return {
    session,
    authUserId: session?.user?.id ?? null,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { id, role } = ctx.session.user;

  return next({
    ctx: {
      ...ctx,
      auth: {
        userId: id,
        // role lives in the JWT (set in your session callback),
        // so no extra DB query needed
        role: role ?? "user",
      },
    },
  });
});