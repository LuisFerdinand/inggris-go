import { notFound, redirect } from "next/navigation";
import ProgramRegisterPageClient from "./client";
import { trpc } from "@/lib/trpc/server";

export default async function ProgramRegisterPage({
  params,
}: {
  params: Promise<{ categorySlug: string; programSlug: string }>;
}) {
  const { categorySlug, programSlug } = await params;
  const data = await trpc.programs.getProgramPage({
    categorySlug,
    programSlug,
  });

  if (!data) {
    notFound();
  }

  return <ProgramRegisterPageClient program={data} />;
}
