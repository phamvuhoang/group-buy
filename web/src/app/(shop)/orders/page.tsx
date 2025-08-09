import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrdersClient from "./page.client";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg">Order History</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <OrdersClient />
        </CardContent>
      </Card>
    </div>
  );
}
