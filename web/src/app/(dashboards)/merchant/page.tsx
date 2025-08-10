import { Suspense } from "react";
import MerchantDashboardClient from "./page.client";

export default function MerchantDashboard() {
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Merchant Dashboard</h1>
      <Suspense fallback={<div>Loading merchant dashboard...</div>}>
        <MerchantDashboardClient />
      </Suspense>
    </div>
  );
}

