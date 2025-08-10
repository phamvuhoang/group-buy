import { supabase } from "./supabaseClient";

/**
 * Helper function to make authenticated API requests
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("Authentication required. Please sign in first.");
  }

  // Add authorization header
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session.access_token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
