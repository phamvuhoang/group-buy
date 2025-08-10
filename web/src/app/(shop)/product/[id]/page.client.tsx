"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeGroups } from "@/hooks/useRealtimeGroup";
import { Button } from "@/components/ui/button";
import GroupCreationModal from "@/components/GroupCreationModal";

import type { Group } from "@/lib/types";

interface ProductClientProps {
  productId: string;
  showSinglePurchase?: boolean;
}

export default function ProductClient({ productId, showSinglePurchase = false }: ProductClientProps) {
  const router = useRouter();
  const { groups } = useRealtimeGroups();
  const [isJoining, setIsJoining] = useState(false);


  const active = groups.find((g: Group) => g.product_id === productId && g.status === "open");

  async function joinActive() {
    if (!active || isJoining) return;

    setIsJoining(true);

    try {
      const { authenticatedFetch } = await import("@/lib/apiClient");
      const res = await authenticatedFetch(`/api/groups/${active.id}/join`, { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          alert("Please sign in to join a group. You can sign in from the profile page.");
        } else {
          alert(json.error || "Failed to join group");
        }
      }
      // Success - realtime will update the actual count
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Network error. Please try again.");
      }
    } finally {
      setIsJoining(false);
    }
  }

  function handleGroupCreated(groupId: string) {
    // Redirect to the new group page
    router.push(`/group/${groupId}`);
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
        <div className="mt-3">
          <GroupCreationModal
            productId={productId}
            onSuccess={handleGroupCreated}
          />
        </div>
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

