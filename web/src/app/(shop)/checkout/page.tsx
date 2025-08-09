import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function CheckoutPage() {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("checkout.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Prototype checkout. In production, integrate Momo / ZaloPay / bank transfer.
          </div>
          <Button className="mt-4 w-full">{t("checkout.payNow")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

