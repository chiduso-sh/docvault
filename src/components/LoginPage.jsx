import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [message, setMessage]   = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error) setMessage("Account created! Check your email to confirm, then sign in.");
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) setError(result.error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="white">
              <rect x="1" y="1" width="5" height="5" rx="1"/>
              <rect x="8" y="1" width="5" height="5" rx="1"/>
              <rect x="1" y="8" width="5" height="5" rx="1"/>
              <rect x="8" y="8" width="5" height="5" rx="1"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900">DocVault</span>
        </div>

        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          {isSignUp ? "Start storing your files securely." : "Sign in to access your vault."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-900 outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-900 outline-none focus:border-brand transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}
          {message && (
            <div className="text-xs text-brand-dark bg-brand-light rounded-lg px-3 py-2">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-brand text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors mt-1"
          >
            {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-5">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            className="text-brand font-semibold hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
