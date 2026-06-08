// app/(dashboard)/dashboard/programs/create/page.tsx
import CreateProgramPageClient from "./client";

export const dynamic = "force-dynamic";

export default async function CreateProgramPage() {
  return <CreateProgramPageClient></CreateProgramPageClient>;
}
