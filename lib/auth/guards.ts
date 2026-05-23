import { redirect } from "next/navigation";

import { getServerSession } from "./session";

export async function requireSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth");
  }

  return session;
}

export async function requireGuest() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return null;
}
