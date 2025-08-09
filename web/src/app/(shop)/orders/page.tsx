import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import OrdersClient from "./page.client";

export default async function OrdersPage() {
  const t = await getTranslations();
  
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
