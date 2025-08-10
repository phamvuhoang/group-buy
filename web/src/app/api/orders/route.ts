import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // Create server-side Supabase client
  const supabase = await createSupabaseServerClient();

  // Get orders for authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return new Response(JSON.stringify({ error: userError.message }), { status: 500 });
  if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Response.json(data || []);
  } catch (e) {
    const err = e as Error;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Orders create API called");
    const { product_id, group_id, amount, type, customer_info, payment_method } = await req.json();
    console.log("Request data:", { product_id, group_id, amount, type, payment_method });

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

  try {
    // Create order
    const { data, error } = await supabase
      .from("orders")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        product_id,
        group_id: group_id || null,
        amount,
        status: "pending",
        customer_name: customer_info?.name || null,
        customer_phone: customer_info?.phone || null,
        customer_address: customer_info?.address || null,
        order_notes: customer_info?.notes || null,
        payment_method: payment_method || 'bank_transfer',
        order_type: type || 'single'
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({
      success: true,
      order: data,
      message: type === "single" ? "Single purchase order created" : "Group order created"
    });
  } catch (e) {
    const err = e as Error;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }

  } catch (error) {
    console.error("Orders API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

