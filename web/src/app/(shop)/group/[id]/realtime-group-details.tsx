"use client";
import { useState } from "react";
import { useRealtimeGroup } from "@/hooks/useRealtimeGroup";
import { useRealtimeParticipants } from "@/hooks/useRealtimeParticipants";
import GroupProgress from "@/components/GroupProgress";
import ShareButtons from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";

interface RealtimeGroupDetailsProps {
  groupId: string;
  productTitle: string;
}

export default function RealtimeGroupDetails({ groupId, productTitle }: RealtimeGroupDetailsProps) {
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
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-2 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!group) {
    return <div className="text-sm text-muted-foreground">Group not found</div>;
  }

  return (
    <div className="space-y-4">
      <GroupProgress 
        current={group.current_count} 
        required={group.required_count} 
        expiresAt={group.expires_at}
        optimisticCurrent={optimisticCount}
      />
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Participants: {participantsLoading ? "..." : participants.length}
        </div>
        <div className="text-sm text-muted-foreground">
          Status: {group.status}
        </div>
        <div className="text-xs text-muted-foreground">
          Group ID: {group.id}
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={joinGroup}
          disabled={isJoining || group.status !== "open"}
        >
          {isJoining ? "Joining..." : group.status === "completed" ? "Group Completed" : "Join Group"}
        </Button>
        
        <ShareButtons 
          url={`${window.location.origin}/group/${group.id}`} 
          title={`Join group for ${productTitle}`} 
        />
      </div>

      {participants.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Participants ({participants.length})</h4>
          <div className="space-y-1">
            {participants.map((participant, index) => (
              <div key={participant.id} className="text-xs text-muted-foreground">
                {index + 1}. User {participant.user_id.slice(-8)}
                <span className="ml-2 text-xs">
                  {new Date(participant.joined_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
