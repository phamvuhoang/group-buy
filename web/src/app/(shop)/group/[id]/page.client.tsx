"use client";
import { Button } from "@/components/ui/button";

export default function GroupJoinClient({ groupId }: { groupId: string }) {
  async function join() {
    const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        alert("Please sign in to join a group. You can sign in from the profile page.");
      } else {
        alert(json.error || "Failed to join group");
      }
    }
  }
  return (
    <Button className="flex-1" onClick={join}>
      Join
    </Button>
  );
}

