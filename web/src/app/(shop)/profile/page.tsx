import { useTranslations } from "next-intl";
import AuthWidget from "@/components/AuthWidget";

export default function ProfilePage() {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t("profile.title")}</h2>
      <AuthWidget />
      <div className="bg-white rounded-lg p-3">Orders • Groups • Settings</div>
    </div>
  );
}

