import { Suspense } from "react";
import CheckoutClient from "./page.client";

export default function CheckoutPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Checkout</h1>
      <Suspense fallback={<div>Loading checkout...</div>}>
        <CheckoutClient />
      </Suspense>
    </div>
  );
}

