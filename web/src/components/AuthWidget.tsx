"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import type { Session } from "@supabase/supabase-js";

export default function AuthWidget() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

      // Use the send-otp API endpoint which should force OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      console.log('OTP response:', result);

      if (!response.ok) throw new Error(result.error);



      setOtpSent(true);
      console.log('OTP sent successfully');
    } catch (e) {
      const err = e as Error;
      console.error('OTP error:', err);
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
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setOtpSent(false);
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
      <div className="text-sm font-medium mb-3">Sign in with Email OTP</div>

      <div className="flex gap-2 items-center">
        <input
          type="email"
          placeholder="you@example.com"
          className="border rounded px-2 py-1 text-sm flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!otpSent ? (
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
        )}
      </div>

      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      {otpSent && !error && <div className="text-xs text-gray-500 mt-2">Check your email for the 6-digit code and enter it above.</div>}

      {otpSent && (
        <button onClick={resetForm} className="text-xs text-blue-600 mt-2 underline">
          Try different email
        </button>
      )}
    </div>
  );
}

