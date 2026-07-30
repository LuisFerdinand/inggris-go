// app/(dashboard)/dashboard/merchant/page.tsx

import { MerchantRegistrationView } from "./_modules/MerchantRegistrationView";

export const dynamic = "force-dynamic";

export default function MerchantPage() {
  return <MerchantRegistrationView />;
}
