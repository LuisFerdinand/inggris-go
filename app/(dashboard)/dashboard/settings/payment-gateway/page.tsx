// app/(dashboard)/dashboard/settings/payment-gateway/page.tsx

import { PaymentGatewaySettingsView } from "./_modules/PaymentGatewaySettingsView";

export const dynamic = "force-dynamic";

export default function PaymentGatewaySettingsPage() {
  return <PaymentGatewaySettingsView />;
}
