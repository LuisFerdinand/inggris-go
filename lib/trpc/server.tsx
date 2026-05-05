import "server-only";
import { headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";

import { makeQueryClient } from "./query-client";
import { createCallerFactory, createTRPCContext } from "./init";
import { type AppRouter, appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(async () =>
  createTRPCContext({
    headers: await headers(),
  }),
);

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
