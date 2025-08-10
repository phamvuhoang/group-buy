"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface GroupCreationFormProps {
  productId: string;
  onSuccess?: (groupId: string) => void;
  onCancel?: () => void;
}

export default function GroupCreationForm({ productId, onSuccess, onCancel }: GroupCreationFormProps) {
  const [requiredCount, setRequiredCount] = useState(3);
  const [expiryHours, setExpiryHours] = useState(48);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      console.log("Starting group creation...");

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session check:", { hasSession: !!session, hasToken: !!session?.access_token });

      if (!session?.access_token) {
        throw new Error("Please sign in first");
      }

      const expires = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();
      const requestData = {
        product_id: productId,
        required_count: requiredCount,
        expires_at: expires
      };

      console.log("Making API request:", requestData);

      const res = await fetch(`/api/groups/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestData),
      });

      console.log("API response status:", res.status);

      const json = await res.json();
      console.log("API response:", json);

      if (!res.ok) {
        console.error("API error:", { status: res.status, error: json });
        if (res.status === 401) {
          setError("Please sign in to create a group. You can sign in from the profile page.");
        } else {
          setError(json.error || `Failed to create group (${res.status})`);
        }
        return;
      }

      // Success
      const groupId = json.group?.id;
      if (groupId) {
        if (onSuccess) {
          onSuccess(groupId);
        } else {
          // Redirect to the new group page
          router.push(`/group/${groupId}`);
        }
      }
    } catch (err) {
      console.error("Group creation error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Group</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="requiredCount" className="block text-sm font-medium mb-2">
              Required Participants
            </label>
            <select
              id="requiredCount"
              value={requiredCount}
              onChange={(e) => setRequiredCount(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
              disabled={isCreating}
            >
              <option value={2}>2 people</option>
              <option value={3}>3 people</option>
              <option value={4}>4 people</option>
              <option value={5}>5 people</option>
              <option value={10}>10 people</option>
              <option value={20}>20 people</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Minimum number of participants needed to complete the group
            </p>
          </div>

          <div>
            <label htmlFor="expiryHours" className="block text-sm font-medium mb-2">
              Group Duration
            </label>
            <select
              id="expiryHours"
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
              disabled={isCreating}
            >
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
              <option value={168}>1 week</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              How long the group will remain open for new participants
            </p>
          </div>

          <div className="p-3 bg-muted rounded text-sm">
            <h4 className="font-medium mb-1">Group Summary</h4>
            <p>• Need {requiredCount} participants to complete</p>
            <p>• Group expires in {expiryHours} hours</p>
            <p>• You'll be the group leader</p>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
