"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthErrorHandler() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        case 'verification_failed':
          setError('Email verification failed. Please try again.');
          break;
        case 'auth_callback_failed':
          setError('Authentication callback failed. Please try again.');
          break;
        default:
          setError('An authentication error occurred.');
      }
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  }, [searchParams]);

  if (!error) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
      <div className="flex items-center">
        <span className="text-sm">{error}</span>
        <button 
          onClick={() => setError(null)}
          className="ml-4 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
    </div>
  );
}
