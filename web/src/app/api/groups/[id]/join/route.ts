import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params;

  // Create server-side Supabase client
  const supabase = await createSupabaseServerClient();

  // Ensure signed-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return new Response(JSON.stringify({ error: userError.message }), { status: 500 });
  if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

  // Atomic join via RPC (handles checks, insert, increment, completion)
  const { data, error } = await supabase.rpc("join_group", {
    p_group_id: groupId,
    p_user_id: user.id
  });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return Response.json({ joined: true, result: data }, { status: 200 });
}

