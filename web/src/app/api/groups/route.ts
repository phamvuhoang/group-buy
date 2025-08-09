import { sbSelectAll } from "@/lib/supabaseRest";

export async function GET() {
  try {
    const items = await sbSelectAll("groups");
    return Response.json(items);
  } catch (e) {
    const err = e as Error;
    return new Response(JSON.stringify({ error: err.message || "Supabase error" }), { status: 500 });
  }
}

