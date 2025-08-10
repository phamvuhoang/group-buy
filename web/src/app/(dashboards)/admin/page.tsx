import { Suspense } from "react";
import AdminDashboardClient from "./page.client";

export default function AdminDashboard() {
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <Suspense fallback={<div>Loading admin dashboard...</div>}>
        <AdminDashboardClient />
      </Suspense>
    </div>
  );
}

