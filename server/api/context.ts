import { auth } from "@/lib/auth/server";

export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return { session };
}
