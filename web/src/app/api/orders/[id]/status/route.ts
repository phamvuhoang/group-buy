import { createClient } from '@supabase/supabase-js';
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("Order status update API called");
    const { id: orderId } = await params;
    const { status } = await req.json();
    console.log("Request data:", { orderId, status });

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log("No authorization header found");
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log("Token received, length:", token.length);

    // Create Supabase client with the user's JWT token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("User verification:", { user: !!user, error: userError });

    if (userError || !user) {
      console.log("User verification failed:", userError);
      return Response.json({ error: "Invalid authentication" }, { status: 401 });
    }

  // Validate status
  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    // Update order status
    const { data, error } = await supabase
      .from("orders")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: "Failed to update order status" }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ 
      message: "Order status updated successfully",
      order: data 
    });

  } catch (error) {
    console.error("Update order status error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  } catch (error) {
    console.error("Order status API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
