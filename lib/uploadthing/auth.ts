import { auth } from "@/lib/auth";
import { db } from "@/app/db/db";
import { role, userRole, type Role } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function getUploadthingAuth(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user.id) {
    return null;
  }

  const rolesResult = await db
    .select({
      role: role.name,
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, session.user.id));

  const roles = rolesResult.map((r: { role: Role }) => r.role);

  return {
    user: session.user,
    roles,
  };
}
