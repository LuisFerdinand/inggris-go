import { getProgramDetail } from "@/lib/utils";
import { redirect } from "next/navigation";
import { CATEGORIES } from "../data";
import ProgramDetailPageClient from "./client";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ category: string; programSlug: string }>;
}) {
  const { category, programSlug } = await params;

  const meta = CATEGORIES[category];
  if (!meta) return redirect("/programs");

  const program = getProgramDetail(programSlug);
  if (!program) return redirect(`/programs/${category}`);

  return <ProgramDetailPageClient details={program} />;
}
