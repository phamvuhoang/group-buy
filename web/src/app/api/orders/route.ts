import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  // Get orders for authenticated user
  const { data: sess, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) return new Response(JSON.stringify({ error: sessErr.message }), { status: 500 });
  const user = sess.session?.user;
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
  const { product_id, group_id, amount, type } = await req.json();

  // Ensure signed-in user
  const { data: sess, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) return new Response(JSON.stringify({ error: sessErr.message }), { status: 500 });
  const user = sess.session?.user;
  if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

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
        status: "pending"
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
}

