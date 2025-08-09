import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  // Return current session (client should call from the browser)
  const { data, error } = await supabase.auth.getSession()
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json({ session: data.session })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { action, email, otp } = body

  try {
    if (action === 'signInWithOtp' && email) {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: undefined } })
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
      return Response.json({ ok: true })
    }
    if (action === 'verifyOtp' && email && otp) {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
      return Response.json({ session: data.session, user: data.user })
    }
    if (action === 'signOut') {
      const { error } = await supabase.auth.signOut()
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
      return Response.json({ ok: true })
    }
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  } catch (e) {
    const err = e as Error
    return new Response(JSON.stringify({ error: err.message || 'Auth error' }), { status: 500 })
  }
}

