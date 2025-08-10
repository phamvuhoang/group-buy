import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { sbSelectOne } from "@/lib/supabaseRest";
import type { Group, Product } from "@/lib/types";
import RealtimeGroupDetails from "./realtime-group-details";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations();
  const { id } = await params;
  const group = await sbSelectOne<Group>("groups", { id });
  if (!group) return <div>{t("group.groupNotFound")}</div>;
  const product = await sbSelectOne<Product>("products", { id: group.product_id });

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg">{t("product.groupFor")} {product?.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <RealtimeGroupDetails groupId={group.id} productTitle={product?.title || "Unknown Product"} />
        </CardContent>
      </Card>
    </div>
  );
}

