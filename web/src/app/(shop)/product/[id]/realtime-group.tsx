"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeGroup } from "@/hooks/useRealtimeGroup";
import { useRealtimeParticipants } from "@/hooks/useRealtimeParticipants";
import GroupProgress from "@/components/GroupProgress";
import ShareButtons from "@/components/ShareButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RealtimeGroupProps {
  groupId: string;
  productTitle: string;
  productId?: string;
}

export default function RealtimeGroup({ groupId, productTitle, productId }: RealtimeGroupProps) {
  const router = useRouter();
  const { group, loading: groupLoading } = useRealtimeGroup(groupId);
  const { participants, loading: participantsLoading } = useRealtimeParticipants(groupId);
  const [isJoining, setIsJoining] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState<number | undefined>();

  async function joinGroup() {
    if (!group || isJoining) return;
    
    setIsJoining(true);
    // Optimistic update
    setOptimisticCount(group.current_count + 1);

    try {
      const res = await fetch(`/api/groups/${group.id}/join`, { method: "POST" });
      const json = await res.json();
      
      if (!res.ok) {
        // Revert optimistic update on error
        setOptimisticCount(undefined);
        if (res.status === 401) {
          alert("Please sign in to join a group. You can sign in from the profile page.");
        } else {
          alert(json.error || "Failed to join group");
        }
      } else {
        // Success - realtime will update the actual count
        setTimeout(() => setOptimisticCount(undefined), 1000);
      }
    } catch {
      setOptimisticCount(undefined);
      alert("Network error. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }

  function buySingle() {
    if (!group) return;
    // Redirect to checkout for single purchase
    const checkoutUrl = `/checkout?product_id=${group.product_id}&type=single`;
    router.push(checkoutUrl);
  }

  function buyGroup() {
    if (!group) return;
    // Redirect to checkout for group purchase
    const checkoutUrl = `/checkout?product_id=${group.product_id}&group_id=${group.id}&type=group`;
    router.push(checkoutUrl);
  }

  if (groupLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!group) {
    return (
      <Card>
        <CardContent className="pt-4">
          <span className="text-sm text-muted-foreground">Group not found</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-sm">{t("product.activeGroup")}</CardTitle>
        <ShareButtons 
          url={`${window.location.origin}/group/${group.id}`} 
          title={`Join group for ${productTitle}`} 
        />
      </CardHeader>
      <CardContent className="pt-4">
        <GroupProgress 
          current={group.current_count} 
          required={group.required_count} 
          expiresAt={group.expires_at}
          optimisticCurrent={optimisticCount}
        />
        
        <div className="space-y-2">
          {group.status === "open" && (
            <Button
              className="w-full"
              onClick={joinGroup}
              disabled={isJoining}
            >
              {isJoining ? "Joining..." : "Join group"}
            </Button>
          )}

          {group.status === "completed" && (
            <Button
              className="w-full"
              onClick={buyGroup}
            >
              Buy at Group Price
            </Button>
          )}

          <Button
            className="w-full"
            variant="secondary"
            onClick={buySingle}
          >
            Buy Single
          </Button>
        </div>
        
        <div className="mt-3 space-y-1">
          <div className="text-xs text-muted-foreground">
            Participants: {participantsLoading ? "..." : participants.length}
          </div>
          <div className="text-xs text-muted-foreground">
            Group ID: {group.id}
          </div>
          <div className="text-xs text-muted-foreground">
            Status: {group.status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
