import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import LoginStatus from "@/components/LoginStatus";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();
  return (
    <div className="max-w-md mx-auto min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-semibold">{t("layout.appTitle")}</h1>
        <div className="flex items-center gap-3">
          <LoginStatus />
          <LocaleSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">{t("layout.menu")}</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">{t("layout.menu")}</h2>
                </div>

                <nav className="flex flex-col gap-1 p-4 flex-1">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("layout.shopping")}</h3>
                    <div className="space-y-1">
                      <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                        <span className="text-lg">🏠</span>
                        <span>{t("layout.home")}</span>
                      </Link>
                      <Link href="/deals" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                        <span className="text-lg">🔥</span>
                        <span>{t("layout.deals")}</span>
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                        <span className="text-lg">📦</span>
                        <span>{t("layout.orders")}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("layout.account")}</h3>
                    <div className="space-y-1">
                      <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                        <span className="text-lg">👤</span>
                        <span>{t("layout.profile")}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("layout.business")}</h3>
                    <div className="space-y-1">
                      <Link href="/merchant" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                        <span className="text-lg">🏪</span>
                        <span>{t("layout.merchantDashboard")}</span>
                      </Link>
                      <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                        <span className="text-lg">⚙️</span>
                        <span>{t("layout.adminDashboard")}</span>
                      </Link>
                      <Link href="/support" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                        <span className="text-lg">🎧</span>
                        <span>{t("layout.supportDashboard")}</span>
                      </Link>
                    </div>
                  </div>
                </nav>

                <div className="p-4 border-t mt-auto">
                  <div className="text-xs text-muted-foreground text-center">
                    {t("layout.version")}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
    </div>
  );
}

