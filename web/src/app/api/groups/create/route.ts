import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { product_id, required_count, expires_at } = await req.json();

  // 1) Create server-side Supabase client
  const supabase = await createSupabaseServerClient();

  // 2) Ensure signed-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return new Response(JSON.stringify({ error: userError.message }), { status: 500 });
  if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

  // 3) Create group with leader_id = current user
  const { data, error } = await supabase
    .from("groups")
    .insert({
      id: crypto.randomUUID(),
      product_id,
      leader_id: user.id,
      required_count,
      expires_at,
      status: "open",
      current_count: 0
    })
    .select();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return Response.json({ group: data?.[0] }, { status: 200 });
}

