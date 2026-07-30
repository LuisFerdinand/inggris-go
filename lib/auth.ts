// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import {
  account as accountTable,
  user as userTable,
} from "@/app/db/schema/auth-schema";
import type { Role } from "@/app/db/schema/roles";
import { isSwitchableRole,} from "@/lib/auth/permissions";
import {
  ensureDefaultStudentRole,
  getPrimaryRole,
  getUserRoles,
} from "@/lib/auth/default-role";
import { generateId } from "@/lib/utils";

const ONE_HOUR = 60 * 60;

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();

  if (!email || !email.includes("@")) return null;

  return email;
}

function getFallbackName(email: string) {
  return email.split("@")[0] || "User";
}

function canUseRequestedRole(roles: Role[], requestedRole: Role) {
  if (!isSwitchableRole(requestedRole)) {
    return false;
  }

  if (roles.includes("super_admin")) {
    return true;
  }

  return roles.includes(requestedRole);
}

async function getDbUserByEmail(email: string) {
  const rows = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
      passwordHash: userTable.passwordHash,
    })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  return rows[0] ?? null;
}

async function upsertGoogleUser(params: {
  email: string;
  name?: string | null;
  image?: string | null;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  scope?: string | null;
  accessTokenExpiresAt?: Date | null;
}) {
  const now = new Date();

  let existingUser = await getDbUserByEmail(params.email);

  if (!existingUser) {
    const userId = generateId("user");

    await db.insert(userTable).values({
      id: userId,
      name: params.name?.trim() || getFallbackName(params.email),
      email: params.email,
      image: params.image ?? null,
      passwordHash: null,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    existingUser = {
      id: userId,
      name: params.name?.trim() || getFallbackName(params.email),
      email: params.email,
      image: params.image ?? null,
      passwordHash: null,
    };
  } else {
    await db
      .update(userTable)
      .set({
        name: existingUser.name || params.name || getFallbackName(params.email),
        image: existingUser.image || params.image || null,
        emailVerified: true,
        updatedAt: now,
      })
      .where(eq(userTable.id, existingUser.id));
  }

  await ensureDefaultStudentRole(existingUser.id);

  await db
    .insert(accountTable)
    .values({
      id: generateId("account"),
      userId: existingUser.id,
      providerId: "google",
      accountId: params.providerAccountId,
      accessToken: params.accessToken ?? null,
      refreshToken: params.refreshToken ?? null,
      idToken: params.idToken ?? null,
      scope: params.scope ?? null,
      accessTokenExpiresAt: params.accessTokenExpiresAt ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  await db
    .update(accountTable)
    .set({
      accessToken: params.accessToken ?? null,
      refreshToken: params.refreshToken ?? null,
      idToken: params.idToken ?? null,
      scope: params.scope ?? null,
      accessTokenExpiresAt: params.accessTokenExpiresAt ?? null,
      updatedAt: now,
    })
    .where(
      and(
        eq(accountTable.providerId, "google"),
        eq(accountTable.accountId, params.providerAccountId),
      ),
    );

  const roles = await getUserRoles(existingUser.id);
  const primaryRole = getPrimaryRole(roles);

  return {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    image: existingUser.image,
    roles,
    role: primaryRole,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  session: {
  strategy: "jwt",
  maxAge: ONE_HOUR,
  updateAge: 60,
},

jwt: {
  maxAge: ONE_HOUR,
},

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) return null;

        const existingUser = await getDbUserByEmail(email);

        if (!existingUser?.passwordHash) return null;

        const validPassword = await bcrypt.compare(
          password,
          existingUser.passwordHash,
        );

        if (!validPassword) return null;

        const roles = await getUserRoles(existingUser.id);
        const primaryRole = getPrimaryRole(roles);

        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
          role: primaryRole,
          roles,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = normalizeEmail(user.email ?? profile?.email);

      if (!email) {
        return false;
      }

      const googleProfile = profile as
        | {
            sub?: string;
            email_verified?: boolean;
            picture?: string;
            name?: string;
          }
        | undefined;

      if (googleProfile?.email_verified === false) {
        return false;
      }

      const providerAccountId =
        account.providerAccountId ?? googleProfile?.sub ?? null;

      if (!providerAccountId) {
        return false;
      }

      const dbUser = await upsertGoogleUser({
        email,
        name: user.name ?? googleProfile?.name,
        image: user.image ?? googleProfile?.picture,
        providerAccountId,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        idToken: account.id_token,
        scope: account.scope,
        accessTokenExpiresAt:
          typeof account.expires_at === "number"
            ? new Date(account.expires_at * 1000)
            : null,
      });

      user.id = dbUser.id;
      user.name = dbUser.name;
      user.email = dbUser.email;
      user.image = dbUser.image;

      Object.assign(user, {
        role: dbUser.role,
        roles: dbUser.roles,
      });

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        const roles = ((user as any).roles ?? []) as Role[];
        const role = ((user as any).role ??
          getPrimaryRole(roles)) as Role;

        token.id = user.id;
        token.role = role;
        token.roles = roles.length ? roles : [role];
        token.activeRole = token.activeRole ?? role;
      }

      if (!token.id && token.email) {
        const dbUser = await getDbUserByEmail(token.email);

        if (dbUser) {
          const roles = await getUserRoles(dbUser.id);
          const role = getPrimaryRole(roles);

          token.id = dbUser.id;
          token.role = role;
          token.roles = roles;
          token.activeRole = role;
        }
      }

      if (trigger === "update") {
        const requestedRole = (
          session as {
            activeRole?: Role;
            user?: { role?: Role; activeRole?: Role };
          }
        )?.activeRole ??
          (
            session as {
              user?: { role?: Role; activeRole?: Role };
            }
          )?.user?.activeRole ??
          (
            session as {
              user?: { role?: Role; activeRole?: Role };
            }
          )?.user?.role;

        const roles = ((token.roles ?? []) as Role[]).filter(Boolean);

        if (
          requestedRole &&
          canUseRequestedRole(roles, requestedRole)
        ) {
          token.activeRole = requestedRole;
        }
      }

      return token;
    },

    async session({ session, token }) {
      const role = (token.role ?? "guest") as Role;
      const roles = ((token.roles ?? [role]) as Role[]).filter(Boolean);
      const activeRole = (token.activeRole ?? role) as Role;

      session.user.id = token.id as string;
      session.user.role = activeRole;
      session.user.activeRole = activeRole;
      session.user.realRole = role;
      session.user.roles = roles;
      session.user.canSwitchRole = role === "super_admin";

      return session;
    },
  },
});