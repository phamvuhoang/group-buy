"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroup";
import { Button } from "@/components/ui/button";

import type { Group } from "@/lib/types";

interface ProductClientProps {
  productId: string;
  showSinglePurchase?: boolean;
}

export default function ProductClient({ productId, showSinglePurchase = false }: ProductClientProps) {
  const router = useRouter();
  const { groups } = useRealtimeGroups();
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);


  const active = groups.find((g: Group) => g.product_id === productId && g.status === "open");

  async function joinActive() {
    if (!active || isJoining) return;

    setIsJoining(true);

    try {
      const res = await fetch(`/api/groups/${active.id}/join`, { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          alert("Please sign in to join a group. You can sign in from the profile page.");
        } else {
          alert(json.error || "Failed to join group");
        }
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
        if (res.status === 401) {
          alert("Please sign in to create a group. You can sign in from the profile page.");
        } else {
          alert(json.error || "Failed to create group");
        }
      }
      // Success - realtime will add the new group
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  function buySingle() {
    // Redirect to checkout for single purchase
    const checkoutUrl = `/checkout?product_id=${productId}&type=single`;
    router.push(checkoutUrl);
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
        >
          Buy Single
        </Button>
      )}
    </div>
  );
}

