"use client";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";

import type { Group } from "@/lib/types";

export default function ProductClient({ productId }: { productId: string }) {
  const { groups } = useGroups();
  const active = groups.find((g: Group) => g.product_id === productId && g.status === "open");

  async function joinActive() {
    if (!active) return;
    const res = await fetch(`/api/groups/${active.id}/join`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Failed to join group");
    }
  }

  async function createGroup() {
    // Example: Required count 3, 48 hours expiry
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`/api/groups/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, required_count: 3, expires_at: expires }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Failed to create group");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {active ? (
        <Button className="mt-3 w-full" onClick={joinActive}>
          Join group
        </Button>
      ) : (
        <Button className="mt-3 w-full" variant="destructive" onClick={createGroup}>
          Create group
        </Button>
      )}
    </div>
  );
}

