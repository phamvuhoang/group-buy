"use client";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((r) => r.json());
export function useGroups() {
  const { data, error, isLoading } = useSWR("/api/groups", fetcher);
  console.log(`useGroups: data=${JSON.stringify(data)}, isLoading=${isLoading}, error=${error}`);
  return { groups: data || [], isLoading, error };
}

