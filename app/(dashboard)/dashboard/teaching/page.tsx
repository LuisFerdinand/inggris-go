// app/(dashboard)/dashboard/teaching/page.tsx
import { TeachingHomeView } from "./_modules/TeachingHomeView";

export const dynamic = "force-dynamic";

export default function TeachingHomePage() {
  return <TeachingHomeView />;
}
