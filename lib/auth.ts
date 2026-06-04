// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/app/db/db";
import { user } from "@/app/db/schema/auth-schema";
import { role, userRole, type Role } from "@/app/db/schema/roles";

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();

  if (!email || !email.includes("@")) return null;

  return email;
}

function normalizePassword(value: unknown) {
  if (typeof value !== "string") return null;

  if (value.length < 6) return null;

  return value;
}

async function getPrimaryRole(userId: string): Promise<Role> {
  const rows = await db
    .select({
      name: role.name,
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId))
    .limit(1);

  return rows[0]?.name ?? "user";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  pages: {
    signIn: "/",
    error: "/",
  },

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = normalizePassword(credentials?.password);

        if (!email || !password) {
          return null;
        }

        const rows = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);

        const existingUser = rows[0];

        if (!existingUser) {
          return null;
        }

        if (!existingUser.passwordHash) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          password,
          existingUser.passwordHash,
        );

        if (!passwordValid) {
          return null;
        }

        const primaryRole = await getPrimaryRole(existingUser.id);

        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
          role: primaryRole,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }

      return session;
    },
  },
});