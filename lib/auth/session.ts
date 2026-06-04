// lib/auth/session.ts
import { auth } from "@/lib/auth";

export async function getServerSession() {
  return auth();
}