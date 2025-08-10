"use client";
import { useEffect, useState } from "react";
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

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">No orders yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your orders will appear here after you make a purchase
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">
              Order #{order.id.slice(-8)}
            </div>
            <div className="text-sm font-bold text-green-600">
              {formatCurrencyVND(order.amount)}
            </div>
          </div>
          
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Product: {order.product_id.slice(-8)}</div>
            {order.group_id && (
              <div>Group: {order.group_id.slice(-8)}</div>
            )}
            <div>Type: {order.order_type || 'single'}</div>
            <div>Payment: {order.payment_method || 'bank_transfer'}</div>
            {order.customer_name && (
              <div>Customer: {order.customer_name}</div>
            )}
            <div>Date: {new Date(order.created_at).toLocaleDateString()}</div>
          </div>
          
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-xs ${
              order.status === "pending" 
                ? "bg-yellow-100 text-yellow-800" 
                : order.status === "paid"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
