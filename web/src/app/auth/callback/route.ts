import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/deals'

  console.log('Auth callback received:', { token_hash: !!token_hash, type, next, origin })

  // Create a server-side Supabase client for auth callback
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (!error) {
        console.log('Auth verification successful, redirecting to:', `${origin}${next}`)
        // Use the request origin to build the correct redirect URL
        return Response.redirect(`${origin}${next}`)
      } else {
        console.error('Auth verification error:', error)
        return Response.redirect(`${origin}/?error=verification_failed`)
      }
    } catch (err) {
      console.error('Auth callback error:', err)
      return Response.redirect(`${origin}/?error=auth_callback_failed`)
    }
  }

  // If there's an error or no token, redirect to home with error
  console.log('No token or type, redirecting to error page')
  return Response.redirect(`${origin}/?error=auth_failed`)
}
