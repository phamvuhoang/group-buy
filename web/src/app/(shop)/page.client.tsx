"use client";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/store/useCart";

export default function HomeClient() {
  const { products, isLoading } = useProducts();
  const add = useCart((s) => s.add);
  if (isLoading) return <div>Loading…</div>;
  return (
    <section className="grid gap-3">
      {products.map((p: any) => (
        <ProductCard key={p.id} product={p} onJoin={() => add(p.id, 1)} />
      ))}
    </section>
  );
}

