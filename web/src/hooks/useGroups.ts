"use client";
import useSWR from "swr";
import type { Group } from "@/lib/types";
const fetcher = (url: string) => fetch(url).then((r) => r.json());
export function useGroups() {
  const { data, error, isLoading } = useSWR<Group[]>("/api/groups", fetcher);
  return { groups: data || [], isLoading, error };
}

