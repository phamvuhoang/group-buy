"use client";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroup";
import { useCart } from "@/store/useCart";

import type { Product } from "@/lib/types";

export default function DealsClient() {
  const { products, isLoading: productsLoading } = useProducts();
  const { groups, loading: groupsLoading } = useRealtimeGroups();
  const add = useCart((s) => s.add);

  if (productsLoading) return <div>Loading products…</div>;

  // Enhance products with active group count
  const enhancedProducts = products.map(product => ({
    ...product,
    current_groups: groups.filter(g => g.product_id === product.id && g.status === "open").length
  }));

  return (
    <section className="grid gap-3">
      {enhancedProducts.map((p: Product) => (
        <ProductCard key={p.id} product={p} onJoin={() => add(p.id, 1)} />
      ))}
      {groupsLoading && (
        <div className="text-xs text-muted-foreground text-center py-2">
          Updating group counts...
        </div>
      )}
    </section>
  );
}
