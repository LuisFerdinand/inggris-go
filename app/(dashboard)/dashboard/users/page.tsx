// app/(dashboard)/dashboard/users/page.tsx

import { UsersView } from "./_modules/UsersView";

export const dynamic = "force-dynamic";

export default function UsersPage() {
  return <UsersView />;
}