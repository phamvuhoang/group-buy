"use client";
import useSWR from "swr";

import type { Product } from "@/lib/types";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProducts() {
  const { data, error, isLoading } = useSWR<Product[]>("/api/products", fetcher);
  return { products: data || [], isLoading, error };
}

