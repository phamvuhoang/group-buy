import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Use Supabase REST API directly to force OTP
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Call Supabase auth API to send OTP
    // Note: Supabase sends "magic links" but we've configured the template to show OTP codes
    const response = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        email,
        create_user: true
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: result.error_description || result.msg || 'Failed to send OTP' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      message: 'OTP sent successfully',
      email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to send OTP'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
