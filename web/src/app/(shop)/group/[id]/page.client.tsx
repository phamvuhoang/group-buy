"use client";
import { Button } from "@/components/ui/button";
import { authenticatedFetch } from "@/lib/apiClient";

export default function GroupJoinClient({ groupId }: { groupId: string }) {
  async function join() {
    try {
      const res = await authenticatedFetch(`/api/groups/${groupId}/join`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          alert("Please sign in to join a group. You can sign in from the profile page.");
        } else {
          alert(json.error || "Failed to join group");
        }
      } else {
        alert("Successfully joined the group!");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Network error. Please try again.");
      }
    }
  }
  return (
    <Button className="flex-1" onClick={join}>
      Join
    </Button>
  );
}

