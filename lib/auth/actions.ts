// lib/auth/actions.ts
"use server";

import { signOut } from "@/lib/auth";

/**
 * Ends the current session server-side and redirects home.
 * Use from a <form action={logout}> in any client/server component.
 */
export async function logout() {
  await signOut({ redirectTo: "/" });
}