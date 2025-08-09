import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";

export default function ProductCard({ product, onJoin }: { product: Product; onJoin: () => void }) {
  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center gap-3 border-b pb-3">
        <div className="w-20 h-20 relative shrink-0">
          <Image src={product.images?.[0] || "/next.svg"} alt={product.title} fill className="object-contain" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm line-clamp-2">{product.title}</CardTitle>
          <div className="mt-1">
            <div className="text-lg font-bold text-red-600">{formatCurrencyVND(product.group_price)}</div>
            <div className="text-xs text-muted-foreground line-through">{formatCurrencyVND(product.price)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{product.current_groups || 0} groups</div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onJoin}>Join</Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href={`/product/${product.id}`}>View</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
