import { useState } from "react";
import { supabase } from "../lib/supabase";

// Three views managed by a single state string
// "signin" | "signup" | "forgot"
export default function LoginPage() {
  const [view, setView]         = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [message, setMessage]   = useState(null);

  function reset() { setError(null); setMessage(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    reset();

    if (view === "forgot") {
      // Supabase sends a password reset email with a magic link.
      // The link redirects to your app's /reset-password route (configured
      // in Supabase Dashboard → Auth → URL Configuration → Redirect URLs).
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setError(error.message);
      else setMessage("Password reset email sent! Check your inbox.");
      setLoading(false);
      return;
    }

    let result;
    if (view === "signup") {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error) setMessage("Account created! Check your email to confirm, then sign in.");
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) setError(result.error.message);
    setLoading(false);
  }

  const titles = {
    signin: { heading: "Welcome back",      sub: "Sign in to access your vault." },
    signup: { heading: "Create an account", sub: "Start storing your files securely." },
    forgot: { heading: "Reset password",    sub: "Enter your email and we'll send a reset link." },
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f6e56 0%, #1a4a7a 50%, #2d1b69 100%)" }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 w-full max-w-md p-8">

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
          <span className="text-xl font-bold text-slate-900 dark:text-white">DocVault</span>
        </div>

        <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          {titles[view].heading}
        </h1>
        <p className="text-sm text-slate-400 mb-6">{titles[view].sub}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:border-brand transition-colors"
            />
          </div>

          {/* Password field — hidden on forgot view */}
          {view !== "forgot" && (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:border-brand transition-colors"
              />
            </div>
          )}

          {/* Forgot password link — only on signin */}
          {view === "signin" && (
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={() => { setView("forgot"); reset(); }}
                className="text-xs text-brand hover:underline"
              >Forgot password?</button>
            </div>
          )}

          {error   && <div className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          {message && <div className="text-xs text-brand-dark bg-brand-light rounded-lg px-3 py-2">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-brand text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors mt-1"
          >
            {loading
              ? "Please wait…"
              : view === "forgot"
              ? "Send reset link"
              : view === "signup"
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        {/* Bottom toggle links */}
        <div className="text-center mt-5 text-sm text-slate-400 space-y-2">
          {view === "signin" && (
            <p>Don&#x2019;t have an account?{" "}
              <button onClick={() => { setView("signup"); reset(); }} className="text-brand font-semibold hover:underline">Sign up</button>
            </p>
          )}
          {view === "signup" && (
            <p>Already have an account?{" "}
              <button onClick={() => { setView("signin"); reset(); }} className="text-brand font-semibold hover:underline">Sign in</button>
            </p>
          )}
          {view === "forgot" && (
            <p>
              <button onClick={() => { setView("signin"); reset(); }} className="text-brand font-semibold hover:underline">← Back to sign in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
