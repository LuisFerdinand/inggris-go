// app/(dashboard)/dashboard/teaching/classes/page.tsx
import { ClassesListView } from "./_modules/ClassesListView";

export const dynamic = "force-dynamic";

export default function ClassesListPage() {
  return <ClassesListView />;
}
