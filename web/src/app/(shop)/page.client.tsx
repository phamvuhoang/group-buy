"use client";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/store/useCart";

import type { Product } from "@/lib/types";

export default function HomeClient() {
  const { products, isLoading } = useProducts();
  const add = useCart((s) => s.add);
  if (isLoading) return <div>Loading…</div>;
  return (
    <section className="grid gap-3">
      {products.map((p: Product) => (
        <ProductCard key={p.id} product={p} onJoin={() => add(p.id, 1)} />
      ))}
    </section>
  );
}

