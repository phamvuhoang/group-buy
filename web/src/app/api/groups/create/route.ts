import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { product_id, required_count, expires_at } = await req.json();

  // 1) Ensure signed-in user
  const { data: sess, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) return new Response(JSON.stringify({ error: sessErr.message }), { status: 500 });
  const user = sess.session?.user;
  if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

  // 2) Create group with leader_id = current user
  const { data, error } = await supabase
    .from("groups")
    .insert({ product_id, leader_id: user.id, required_count, expires_at, status: "open" })
    .select();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return Response.json({ group: data?.[0] }, { status: 200 });
}

