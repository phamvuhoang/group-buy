const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getHeaders() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  } as Record<string, string>;
}

export async function sbSelectAll<T = any>(table: string, query: string = "*"): Promise<T[]> {
  const headers = getHeaders();
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase select error (${res.status}): ${text}`);
  }
  return res.json();
}

export async function sbInsert<T = any>(table: string, rows: any | any[]): Promise<T[]> {
  const headers = getHeaders();
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, { method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(rows) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase insert error (${res.status}): ${text}`);
  }
  return res.json();
}



export async function sbSelectWhere<T = any>(
  table: string,
  where: Record<string, string | number | boolean>,
  select: string = "*"
): Promise<T[]> {
  const headers = getHeaders();
  const params = new URLSearchParams({ select });
  for (const [key, value] of Object.entries(where)) {
    params.append(key, `eq.${value}`);
  }
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase selectWhere error (${res.status}): ${text}`);
  }
  return res.json();
}

export async function sbSelectOne<T = any>(
  table: string,
  where: Record<string, string | number | boolean>,
  select: string = "*"
): Promise<T | null> {
  const rows = await sbSelectWhere<T>(table, where, select);
  return rows?.[0] ?? null;
}
