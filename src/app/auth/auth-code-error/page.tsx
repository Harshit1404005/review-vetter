"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  const reason = params.get("reason") || "unknown";

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-10 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2">Authentication Failed</h1>
        <p className="text-sm text-slate-500 mb-1">
          We couldn&apos;t complete the sign-in process.
        </p>
        {reason !== "unknown" && (
          <p className="text-xs text-red-400 font-mono bg-red-50 rounded-lg px-3 py-2 mb-5 mt-3">
            {reason}
          </p>
        )}
        <p className="text-xs text-slate-400 mb-8">
          This usually happens if the login link expired or your Supabase redirect URL isn&apos;t configured.
          Make sure <code className="bg-slate-100 px-1 rounded">http://localhost:3000/auth/callback</code> is added to your Supabase allowed redirect URLs.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all"
          >
            Try Again
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthCodeError() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
