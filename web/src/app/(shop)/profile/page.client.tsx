"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthWidget from "@/components/AuthWidget";
import { supabase } from "@/lib/supabaseClient";
import { formatCurrencyVND } from "@/lib/format";

interface Order {
  id: string;
  product_id: string;
  group_id: string | null;
  amount: number;
  status: string;
  created_at: string;
  customer_name?: string;
  order_type?: string;
  payment_method?: string;
}

interface Group {
  id: string;
  product_id: string;
  required_count: number;
  current_count: number;
  status: string;
  created_at: string;
  expires_at: string;
  leader_id: string;
}

export default function ProfileClient() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'groups' | 'settings'>('orders');

  useEffect(() => {
    async function loadUserData() {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          // Load orders
          const ordersRes = await fetch("/api/orders");
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData);
          }

          // Load user's groups (both created and joined)
          const groupsRes = await fetch("/api/groups");
          if (groupsRes.ok) {
            const allGroups = await groupsRes.json();
            // Filter groups where user is leader or participant
            // For now, just show all groups - in production, we'd filter by user participation
            setGroups(allGroups.slice(0, 5)); // Show recent 5 groups
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setOrders([]);
        setGroups([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthWidget />
        </CardContent>
      </Card>

      {user && (
        <>
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'groups'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Groups ({groups.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'orders' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order History</CardTitle>
                <Link href="/orders">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No orders yet</p>
                    <Link href="/deals">
                      <Button className="mt-2" size="sm">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">
                            Order #{order.id.slice(-8)}
                          </div>
                          <div className="text-sm font-bold">
                            {formatCurrencyVND(order.amount)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{order.order_type || 'single'} purchase</span>
                          <span className={`px-2 py-1 rounded ${
                            order.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : order.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'groups' && (
            <Card>
              <CardHeader>
                <CardTitle>My Groups</CardTitle>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No groups yet</p>
                    <Link href="/deals">
                      <Button className="mt-2" size="sm">Join a Group</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.map((group) => (
                      <div key={group.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">
                            Group #{group.id.slice(-8)}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            group.status === 'open' 
                              ? 'bg-blue-100 text-blue-800' 
                              : group.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {group.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Progress: {group.current_count}/{group.required_count} members</div>
                          <div>Created: {new Date(group.created_at).toLocaleDateString()}</div>
                          {group.status === 'open' && (
                            <div>Expires: {new Date(group.expires_at).toLocaleDateString()}</div>
                          )}
                        </div>
                        <Link href={`/group/${group.id}`}>
                          <Button variant="outline" size="sm" className="mt-2 w-full">
                            View Group
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Account Information</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Email: {user.email}</div>
                    <div>User ID: {user.id.slice(-8)}</div>
                    <div>Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/orders">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Orders
                      </Button>
                    </Link>
                    <Link href="/deals">
                      <Button variant="outline" size="sm" className="w-full">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
