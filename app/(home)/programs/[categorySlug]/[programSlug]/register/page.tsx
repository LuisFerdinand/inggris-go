// app/(home)/programs/[categorySlug]/[programSlug]/register/page.tsx
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ categorySlug: string; programSlug: string }>;
}) {
  const { categorySlug, programSlug } = await params;

  return (
    <RegisterClient categorySlug={categorySlug} programSlug={programSlug} />
  );
}