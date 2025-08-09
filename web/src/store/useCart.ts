import { create } from "zustand";

export type CartItem = { id: string; qty: number };

type CartState = {
  items: CartItem[];
  add: (id: string, qty?: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (id, qty = 1) => set((s) => {
    const existing = s.items.find((it) => it.id === id);
    if (existing) {
      return { items: s.items.map((it) => (it.id === id ? { ...it, qty: it.qty + qty } : it)) };
    }
    return { items: [...s.items, { id, qty }] };
  }),
  clear: () => set({ items: [] }),
}));

