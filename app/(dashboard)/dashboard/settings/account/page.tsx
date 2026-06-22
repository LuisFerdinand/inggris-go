// app/(dashboard)/dashboard/settings/account/page.tsx
import { ChangePasswordView } from "./_modules/ChangePasswordView";

export const dynamic = "force-dynamic";

export default function AccountSettingsPage() {
  return <ChangePasswordView />;
}