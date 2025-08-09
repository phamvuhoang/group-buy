"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const target = locale === "vi" ? "en" : "vi";
  const label = target.toUpperCase();

  function switchLocale() {
    // next-intl reads the NEXT_LOCALE cookie by default
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <button onClick={switchLocale} className="text-sm underline underline-offset-4">
      {label}
    </button>
  );
}

