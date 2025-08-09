import { create } from "zustand";

type UserState = {
  id?: string;
  locale: "en" | "vi";
  setLocale: (locale: "en" | "vi") => void;
};

export const useUser = create<UserState>((set) => ({
  id: undefined,
  locale: "en",
  setLocale: (locale) => set({ locale }),
}));

