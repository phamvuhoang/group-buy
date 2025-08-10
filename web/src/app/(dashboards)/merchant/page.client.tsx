"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";

type Product = {
  id: string;
  title: string;
  price: number;
  group_price: number;
  images: string[];
  created_at: string;
};

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

type Group = {
  id: string;
  product_id: string;
  required_count: number;
  current_count: number;
  status: string;
  created_at: string;
};

export default function MerchantDashboardClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load products
        const productsRes = await fetch("/api/products");
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }

        // Load orders
        const ordersRes = await fetch("/api/orders");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }

        // Load groups
        const groupsRes = await fetch("/api/groups");
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setGroups(groupsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div>Loading merchant dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const totalRevenue = orders
    .filter(order => order.status === "paid" || order.status === "shipped" || order.status === "delivered")
    .reduce((sum, order) => sum + order.amount, 0);

  const activeGroups = groups.filter(group => group.status === "active");
  const completedGroups = groups.filter(group => group.status === "completed");

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
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
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeGroups.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrencyVND(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center">
              <span className="text-lg mb-1">📦</span>
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-lg mb-1">📊</span>
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-lg mb-1">🎯</span>
              <span>Create Promotion</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
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
              {orders.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">View All Orders</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Active Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {activeGroups.length === 0 ? (
            <p className="text-muted-foreground">No active groups</p>
          ) : (
            <div className="space-y-3">
              {activeGroups.map((group) => {
                const product = products.find(p => p.id === group.product_id);
                const progress = (group.current_count / group.required_count) * 100;
                
                return (
                  <div key={group.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        {product?.title || `Product ${group.product_id.slice(-8)}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {group.current_count}/{group.required_count} members
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(progress)}% complete • Created {new Date(group.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
