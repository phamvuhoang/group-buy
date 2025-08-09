"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="text-xs text-muted-foreground flex items-center gap-2">
      {email ? (
        <>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            Signed in
          </span>
          <span className="text-gray-400">·</span>
          <span className="truncate max-w-[120px]" title={email}>{email}</span>
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
            Guest
          </span>
          <Link href="/profile" className="underline underline-offset-2">Login</Link>
        </>
      )}
    </div>
  );
}

