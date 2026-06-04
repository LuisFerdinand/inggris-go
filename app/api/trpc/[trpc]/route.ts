// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/routers/_app";
import { createTRPCContext } from "@/lib/trpc/init";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext(),
    onError({ error, path }) {
      console.error(`❌ tRPC failed on ${path ?? "<no-path>"}:`, error);
    },
  });

export { handler as GET, handler as POST };