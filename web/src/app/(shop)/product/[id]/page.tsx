import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { formatCurrencyVND } from "@/lib/format";
import ProductRealtimeClient from "./page.client";
import RealtimeGroup from "./realtime-group";
import { sbSelectOne, sbSelectWhere } from "@/lib/supabaseRest";
import type { Product, Group } from "@/lib/types";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations();
  const { id } = await params;
  const product = await sbSelectOne<Product>("products", { id });
  if (!product) return <div>Not found</div>;

  const groups = await sbSelectWhere<Group>("groups", { product_id: product.id, status: "open" });
  const activeGroup = groups[0];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg">{product.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="w-full aspect-square relative bg-white rounded-lg">
            <Image src={product.images?.[0] || "/next.svg"} alt={product.title} fill className="object-contain" />
          </div>
          <p className="text-sm text-muted-foreground mt-3">{product.description}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">{formatCurrencyVND(product.group_price)}</span>
            <span className="text-xs text-muted-foreground line-through">{formatCurrencyVND(product.price)}</span>
          </div>
        </CardContent>
      </Card>

      {activeGroup ? (
        <RealtimeGroup groupId={activeGroup.id} productTitle={product.title} productId={product.id} />
      ) : (
        <Card>
          <CardContent className="pt-4">
            <span className="text-sm">{t("product.noActiveGroup")}</span>
            <ProductRealtimeClient productId={product.id} showSinglePurchase={true} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

