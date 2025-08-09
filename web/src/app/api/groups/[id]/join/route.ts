import { supabase } from "@/lib/supabaseClient";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params;
  // Ensure signed-in user
  const { data: sess, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) return new Response(JSON.stringify({ error: sessErr.message }), { status: 500 });
  const user = sess.session?.user;
  if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

  // Atomic join via RPC (handles checks, insert, increment, completion)
  const { data, error } = await supabase.rpc("join_group", { p_group_id: groupId });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return Response.json({ joined: true, result: data }, { status: 200 });
}

