"use client";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";

export default function ProductClient({ productId }: { productId: string }) {
  const { groups } = useGroups();
  const active = groups.find((g: any) => g.product_id === productId && g.status === "open");

  async function joinActive() {
    if (!active) return;
    const res = await fetch(`/api/groups/${active.id}/join`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Failed to join group");
    }
  }

  return (
    <div>
      {active && (
        <Button className="mt-3 w-full" onClick={joinActive}>
          Join group
        </Button>
      )}
    </div>
  );
}

