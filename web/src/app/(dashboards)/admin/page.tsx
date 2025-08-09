export default function AdminDashboard() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Admin Dashboard</h1>
      <ul className="list-disc ml-6 space-y-2">
        <li>Platform metrics</li>
        <li>Merchant approvals & user moderation</li>
        <li>Financial reports (subsidies, refunds)</li>
        <li>Feature toggles</li>
      </ul>
    </div>
  );
}

