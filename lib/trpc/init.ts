import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "@/app/db/db";
import { role, userRole, user } from "@/app/db/schema";

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

  const [authUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, ctx.authUserId))
    .limit(1);

  if (!authUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
  }

  const roleRows = await db
    .select({ role: role.name })
    .from(userRole)
    .innerJoin(role, eq(role.id, userRole.roleId))
    .where(eq(userRole.userId, authUser.id));

  const roles = roleRows.map((r) => r.role);
  return next({
    ctx: { ...ctx, auth: { userId: authUser.id, user: authUser, roles } },
  });
});
