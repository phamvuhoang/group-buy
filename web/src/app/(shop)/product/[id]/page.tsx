import Image from "next/image";
import GroupProgress from "@/components/GroupProgress";
import ShareButtons from "@/components/ShareButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { formatCurrencyVND } from "@/lib/format";
import ProductClient from "./page.client";
import { sbSelectOne, sbSelectWhere } from "@/lib/supabaseRest";
import type { Product, Group } from "@/lib/types";

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const t = await getTranslations();
  const product = await sbSelectOne<Product>("products", { id: params.id });
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
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b pb-3">
            <CardTitle className="text-sm">{t("product.activeGroup")}</CardTitle>
            <ShareButtons url={`https://example.com/group/${activeGroup.id}`} title={`Join group for ${product.title}`} />
          </CardHeader>
          <CardContent className="pt-4">
            <GroupProgress current={activeGroup.current_count} required={activeGroup.required_count} expiresAt={activeGroup.expires_at} />
            <ProductClient productId={product.id} />
            <div className="mt-2 text-xs text-muted-foreground">Group ID: {activeGroup?.id}</div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <span className="text-sm">{t("product.noActiveGroup")}</span>
            <Button className="mt-3 w-full" variant="destructive">{t("product.create")}</Button>
          </CardContent>
        </Card>
      )}

      <Button className="w-full" variant="secondary">{t("product.buySingle")}</Button>
    </div>
  );
}

