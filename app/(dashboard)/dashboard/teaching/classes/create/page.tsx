// app/(dashboard)/dashboard/teaching/classes/create/page.tsx
import { Suspense } from "react";
import { CreateClassView } from "./_modules/CreateClassView";

export const dynamic = "force-dynamic";

export default function CreateClassPage() {
  return (
    <Suspense fallback={null}>
      <CreateClassView />
    </Suspense>
  );
}
