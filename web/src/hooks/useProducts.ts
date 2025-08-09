"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProducts() {
  const { data, error, isLoading } = useSWR("/api/products", fetcher);
  console.log(`userProducts: data=${JSON.stringify(data)}, isLoading=${isLoading}, error=${error}`);
  return { products: data || [], isLoading, error };
}

