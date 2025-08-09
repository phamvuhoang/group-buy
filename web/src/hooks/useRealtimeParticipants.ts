"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type GroupParticipant = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
};

export function useRealtimeParticipants(groupId: string | null) {
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    // Initial fetch
    async function fetchParticipants() {
      try {
        const { data, error } = await supabase
          .from("group_participants")
          .select("*")
          .eq("group_id", groupId)
          .order("joined_at", { ascending: true });

        if (!mounted) return;

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        setParticipants(data || []);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch participants");
        setLoading(false);
      }
    }

    fetchParticipants();

    // Set up realtime subscription
    const subscription = supabase
      .channel(`participants-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_participants",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            setParticipants((prev) => [...prev, payload.new as GroupParticipant]);
          } else if (payload.eventType === "DELETE") {
            setParticipants((prev) =>
              prev.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [groupId]);

  return { participants, loading, error };
}
