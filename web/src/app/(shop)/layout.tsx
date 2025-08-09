import type { ReactNode } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import LoginStatus from "@/components/LoginStatus";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-semibold">VN Group Buy</h1>
        <div className="flex items-center gap-3">
          <LoginStatus />
          <LocaleSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">Menu</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-2 mt-8">
                <Link href="/deals" className="underline-offset-2 hover:underline">Deals</Link>
                <Link href="/profile" className="underline-offset-2 hover:underline">Profile</Link>
                <Link href="/merchant" className="underline-offset-2 hover:underline">Merchant</Link>
                <Link href="/admin" className="underline-offset-2 hover:underline">Admin</Link>
                <Link href="/support" className="underline-offset-2 hover:underline">Support</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
    </div>
  );
}

