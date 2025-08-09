"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Group } from "@/lib/types";

export function useRealtimeGroup(groupId: string | null) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    // Initial fetch
    async function fetchGroup() {
      try {
        const { data, error } = await supabase
          .from("groups")
          .select("*")
          .eq("id", groupId)
          .single();

        if (!mounted) return;

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        setGroup(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch group");
        setLoading(false);
      }
    }

    fetchGroup();

    // Set up realtime subscription
    const subscription = supabase
      .channel(`group-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "groups",
          filter: `id=eq.${groupId}`,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "UPDATE") {
            setGroup(payload.new as Group);
          } else if (payload.eventType === "DELETE") {
            setGroup(null);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [groupId]);

  return { group, loading, error };
}

export function useRealtimeGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Initial fetch
    async function fetchGroups() {
      try {
        const { data, error } = await supabase
          .from("groups")
          .select("*")
          .order("created_at", { ascending: false });

        if (!mounted) return;

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        setGroups(data || []);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch groups");
        setLoading(false);
      }
    }

    fetchGroups();

    // Set up realtime subscription for all groups
    const subscription = supabase
      .channel("groups")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "groups",
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            setGroups((prev) => [payload.new as Group, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setGroups((prev) =>
              prev.map((group) =>
                group.id === payload.new.id ? (payload.new as Group) : group
              )
            );
          } else if (payload.eventType === "DELETE") {
            setGroups((prev) =>
              prev.filter((group) => group.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { groups, loading, error };
}
