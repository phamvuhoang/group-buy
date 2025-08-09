"use client";
import { useState } from "react";
import { useRealtimeGroup } from "@/hooks/useRealtimeGroup";
import { useRealtimeParticipants } from "@/hooks/useRealtimeParticipants";
import GroupProgress from "@/components/GroupProgress";
import ShareButtons from "@/components/ShareButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface RealtimeGroupProps {
  groupId: string;
  productTitle: string;
}

export default function RealtimeGroup({ groupId, productTitle }: RealtimeGroupProps) {
  const t = useTranslations();
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
        alert(json.error || "Failed to join group");
      } else {
        // Success - realtime will update the actual count
        setTimeout(() => setOptimisticCount(undefined), 1000);
      }
    } catch (error) {
      setOptimisticCount(undefined);
      alert("Network error. Please try again.");
    } finally {
      setIsJoining(false);
    }
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
        
        <Button 
          className="mt-3 w-full" 
          onClick={joinGroup}
          disabled={isJoining || group.status !== "open"}
        >
          {isJoining ? "Joining..." : group.status === "completed" ? "Group Completed" : "Join group"}
        </Button>
        
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
