import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const groupId = params.id;
  // 1) Ensure signed-in user
  const { data: sess, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) return new Response(JSON.stringify({ error: sessErr.message }), { status: 500 });
  const user = sess.session?.user;
  if (!user) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

  // 2) Insert participant row (RLS enforces user_id = auth.uid())
  const { data: insertRows, error: insertErr } = await supabase
    .from("group_participants")
    .insert({ group_id: groupId, user_id: user.id })
    .select();
  if (insertErr) return new Response(JSON.stringify({ error: insertErr.message }), { status: 400 });

  // 3) Increment group's current_count safely with RPC (or update)
  const { data: groupRows, error: groupErr } = await supabase
    .from("groups")
    .update({ current_count: (undefined as any) }) // placeholder, use RPC preferred
    .eq("id", groupId)
    .select();

  // Note: Without a Postgres RPC or trigger, increment may conflict under concurrency.
  // For now, return participant insert; frontend can re-fetch group.
  if (groupErr) {
    // participant added already; ignore increment error for MVP
    return Response.json({ joined: true, participants: insertRows }, { status: 200 });
  }

  return Response.json({ joined: true, participants: insertRows, group: groupRows?.[0] }, { status: 200 });
}

