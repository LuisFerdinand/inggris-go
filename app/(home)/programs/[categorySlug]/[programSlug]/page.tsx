import { getProgramDetail } from "@/lib/utils";
import { redirect } from "next/navigation";
import { CATEGORIES } from "../data";
import ProgramDetailPageClient from "./client";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; programSlug: string }>;
}) {
  const { categorySlug, programSlug } = await params;

  const meta = CATEGORIES[categorySlug];
  if (!meta) return redirect("/programs");

  const program = getProgramDetail(programSlug);
  if (!program) return redirect(`/programs/${categorySlug}`);

  return <ProgramDetailPageClient details={program} />;
}
