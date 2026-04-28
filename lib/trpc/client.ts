import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/app/server/api/root";

export const trpc = createTRPCReact<AppRouter>();
