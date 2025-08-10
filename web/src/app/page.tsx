import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations();
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">{t("app.title")}</h1>
        <p className="text-sm text-gray-600 mb-6">{t("app.subtitle")}</p>
        <Link href="/deals" className="inline-block bg-red-600 text-white px-4 py-2 rounded">
          {t("cta.enter")}
        </Link>
      </div>
    </div>
  );
}
