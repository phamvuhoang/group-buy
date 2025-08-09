"use client";
import { useState } from "react";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroup";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import type { Group } from "@/lib/types";

interface ProductClientProps {
  productId: string;
  showSinglePurchase?: boolean;
}

export default function ProductClient({ productId, showSinglePurchase = false }: ProductClientProps) {
  const t = useTranslations();
  const { groups } = useRealtimeGroups();
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const active = groups.find((g: Group) => g.product_id === productId && g.status === "open");

  async function joinActive() {
    if (!active || isJoining) return;

    setIsJoining(true);

    try {
      const res = await fetch(`/api/groups/${active.id}/join`, { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to join group");
      }
      // Success - realtime will update the actual count
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }

  async function createGroup() {
    if (isCreating) return;

    setIsCreating(true);
    // Example: Required count 3, 48 hours expiry
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    try {
      const res = await fetch(`/api/groups/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, required_count: 3, expires_at: expires }),
      });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to create group");
      }
      // Success - realtime will add the new group
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function buySingle() {
    if (isBuying) return;

    setIsBuying(true);

    try {
      // Get product details for pricing
      const productRes = await fetch(`/api/products`);
      const products = await productRes.json();
      const product = products.find((p: { id: string; price: number }) => p.id === productId);

      if (!product) {
        alert("Product not found");
        return;
      }

      const res = await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          amount: product.price, // Use retail price for single purchase
          type: "single"
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to create order");
      } else {
        alert(`Order created! Order ID: ${json.order.id}`);
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsBuying(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {active ? (
        <Button
          className="mt-3 w-full"
          onClick={joinActive}
          disabled={isJoining}
        >
          {isJoining ? "Joining..." : "Join group"}
        </Button>
      ) : (
        <Button
          className="mt-3 w-full"
          variant="destructive"
          onClick={createGroup}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create group"}
        </Button>
      )}

      {showSinglePurchase && (
        <Button
          className="w-full"
          variant="secondary"
          onClick={buySingle}
          disabled={isBuying}
        >
          {isBuying ? "Processing..." : t("product.buySingle")}
        </Button>
      )}
    </div>
  );
}

