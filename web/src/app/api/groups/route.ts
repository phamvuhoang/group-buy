import { sbSelectAll } from "@/lib/supabaseRest";

export async function GET() {
  try {
    const items = await sbSelectAll("groups");
    return Response.json(items);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Supabase error" }), { status: 500 });
  }
}

