// app/(dashboard)/dashboard/orders/page.tsx
import { OrdersView } from "./_modules/OrdersView";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return <OrdersView />;
}