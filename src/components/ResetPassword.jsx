// ResetPassword.jsx
// Supabase redirects here after the user clicks the reset link in their email.
// The URL contains a token that Supabase Auth reads automatically via onAuthStateChange.
// We just need to show a new password form and call updateUser.

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(false);
  const [validSession, setValidSession] = useState(false);

  // Supabase fires an event "PASSWORD_RECOVERY" when the reset link is clicked.
  // We listen for it to confirm the token is valid before showing the form.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setValidSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Sign out so the user logs in fresh with their new password
      setTimeout(() => supabase.auth.signOut(), 2000);
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f6e56 0%, #1a4a7a 50%, #2d1b69 100%)" }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 w-full max-w-md p-8">

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

        {success ? (
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Password updated!</p>
            <p className="text-sm text-slate-400">Redirecting you to sign in…</p>
          </div>
        ) : !validSession ? (
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Waiting for reset link…</p>
            <p className="text-xs text-slate-400">Open the password reset link from your email to continue.</p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Set new password</h1>
            <p className="text-sm text-slate-400 mb-6">Choose a new password for your account.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white bg-white dark:bg-slate-700 outline-none focus:border-brand"
                />
              </div>

              {error && <div className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold rounded-lg bg-brand text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors mt-1"
              >{loading ? "Updating…" : "Update password"}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
