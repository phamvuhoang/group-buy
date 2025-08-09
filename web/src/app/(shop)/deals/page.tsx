import { useTranslations } from "next-intl";
import DealsClient from "./page.client";

export default function DealsPage() {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-lg">
          <h2 className="text-lg font-bold">{t("home.groupDeals")}</h2>
          <p className="text-sm opacity-90">{t("home.tagline")}</p>
        </div>
      </section>

      <DealsClient />
    </div>
  );
}

