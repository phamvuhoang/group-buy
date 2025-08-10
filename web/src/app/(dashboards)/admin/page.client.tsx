"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";

type Order = {
  id: string;
  product_id: string;
  group_id: string | null;
  amount: number;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  payment_method?: string;
  order_type?: string;
};

export default function AdminDashboardClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    try {
      const { authenticatedFetch } = await import("@/lib/apiClient");
      const res = await authenticatedFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      // Refresh orders
      await fetchOrders();
      alert(`Order ${orderId.slice(-8)} status updated to ${newStatus}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setUpdating(null);
    }
  }

  const pendingOrders = orders.filter(order => order.status === "pending");
  const paidOrders = orders.filter(order => order.status === "paid");
  const totalRevenue = orders
    .filter(order => order.status === "paid" || order.status === "shipped" || order.status === "delivered")
    .reduce((sum, order) => sum + order.amount, 0);

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrencyVND(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders - Needs Admin Approval */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Bank Transfer Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <p className="text-muted-foreground">No pending orders</p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">Order #{order.id.slice(-8)}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-bold text-lg">{formatCurrencyVND(order.amount)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Customer:</span> {order.customer_name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span> {order.customer_phone || 'N/A'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span> {order.order_type || 'single'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment:</span> {order.payment_method || 'bank_transfer'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, "paid")}
                      disabled={updating === order.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updating === order.id ? "Updating..." : "Confirm Payment"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                      disabled={updating === order.id}
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Orders */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">#{order.id.slice(-8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrencyVND(order.amount)}</div>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      order.status === "pending" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : order.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "delivered"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
