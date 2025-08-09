"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import type { Session } from "@supabase/supabase-js";

type AuthMethod = 'otp' | 'magiclink';

export default function AuthWidget() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authMethod, setAuthMethod] = useState<AuthMethod>('otp');
  const [otpSent, setOtpSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshSession() {
    setError(null);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(data.session || null);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    }
  }

  useEffect(() => {
    refreshSession();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      setSession(_session);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function sendOtp() {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending OTP to:', email);
      // Use the REST API directly to force OTP instead of magic link
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      console.log('OTP response:', result);

      if (!response.ok) throw new Error(result.error);

      setOtpSent(true);
    } catch (e) {
      const err = e as Error;
      console.error('OTP error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    setLoading(true);
    setError(null);
    try {
      // Always use the current origin for redirect URL
      const redirectUrl = `${window.location.origin}/auth/callback?next=/deals`;

      console.log('Sending magic link to:', email, 'with redirect:', redirectUrl);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      console.log('Magic link response:', { error });

      if (error) throw error;
      setMagicLinkSent(true);
    } catch (e) {
      const err = e as Error;
      console.error('Magic link error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
      if (error) throw error;
      setSession(data.session || null);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setOtp("");
      setOtpSent(false);
      setMagicLinkSent(false);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setOtpSent(false);
    setMagicLinkSent(false);
    setOtp("");
    setError(null);
  }

  if (session) {
    const email = session.user?.email;
    return (
      <div className="border rounded p-3 flex items-center justify-between">
        <div className="text-sm">Signed in as <span className="font-medium">{email}</span></div>
        <button onClick={signOut} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm" disabled={loading}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="border rounded p-3">
      <div className="text-sm font-medium mb-3">Sign in</div>

      {/* Auth method selector */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setAuthMethod('otp')}
          className={`px-3 py-1 rounded text-xs ${authMethod === 'otp' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
        >
          Enter Code
        </button>
        <button
          onClick={() => setAuthMethod('magiclink')}
          className={`px-3 py-1 rounded text-xs ${authMethod === 'magiclink' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
        >
          Click Link
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="email"
          placeholder="you@example.com"
          className="border rounded px-2 py-1 text-sm flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {authMethod === 'otp' ? (
          !otpSent ? (
            <button onClick={sendOtp} className="bg-blue-600 text-white px-3 py-1 rounded text-sm" disabled={loading || !email}>
              Send OTP
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="OTP"
                className="border rounded px-2 py-1 text-sm w-24"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button onClick={verifyOtp} className="bg-green-600 text-white px-3 py-1 rounded text-sm" disabled={loading || !otp}>
                Verify
              </button>
            </>
          )
        ) : (
          !magicLinkSent ? (
            <button onClick={sendMagicLink} className="bg-purple-600 text-white px-3 py-1 rounded text-sm" disabled={loading || !email}>
              Send Link
            </button>
          ) : (
            <button onClick={resetForm} className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
              Try Again
            </button>
          )
        )}
      </div>

      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      {otpSent && !error && <div className="text-xs text-gray-500 mt-2">Check your email for the 6-digit code and enter it above.</div>}
      {magicLinkSent && !error && <div className="text-xs text-gray-500 mt-2">Check your email and click the link to sign in automatically.</div>}

      {(otpSent || magicLinkSent) && (
        <button onClick={resetForm} className="text-xs text-blue-600 mt-2 underline">
          Use different method
        </button>
      )}
    </div>
  );
}

