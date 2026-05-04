import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "@/app/db/db";
import { user as users } from "@/app/db/schema";

export const createTRPCContext = async (opts?: { headers?: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts?.headers ?? new Headers(),
  });

  return {
    session,
    authUserId: session?.user.id ?? null,
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
  if (!ctx.authUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, ctx.authUserId))
    .limit(1);

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
