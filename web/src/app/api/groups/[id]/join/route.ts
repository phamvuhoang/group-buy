import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("Group join API called");
    const { id: groupId } = await params;
    console.log("Group ID:", groupId);

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

  // Atomic join via RPC (handles checks, insert, increment, completion)
  console.log("Calling join_group RPC for group:", groupId, "user:", user.id);
  const { data, error } = await supabase.rpc("join_group", {
    p_group_id: groupId
  });

  console.log("RPC result:", { data, error });

  if (error) {
    console.error("RPC error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  console.log("Group join successful:", data);
  return Response.json({ joined: true, result: data }, { status: 200 });

  } catch (error) {
    console.error("Group join API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

