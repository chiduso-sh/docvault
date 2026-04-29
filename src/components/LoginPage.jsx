// src/components/LoginPage.jsx
// Handles both Sign In and Sign Up in one form, toggled by a state flag.

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [isSignUp, setIsSignUp]   = useState(false);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [message, setMessage]     = useState(null); // success messages

  async function handleSubmit(e) {
    // preventDefault stops the browser from doing a full page reload
    // (the default behaviour of a form submit)
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    let result;

    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error) {
        setMessage("Account created! Check your email to confirm, then sign in.");
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
      // On success, onAuthStateChange in AuthContext fires automatically
      // and updates the session — no manual redirect needed.
    }

    if (result.error) setError(result.error.message);
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#f1f5f9",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "white", borderRadius: 16, padding: 36,
        width: 400, maxWidth: "90vw",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "#0F6E56",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 14 14" fill="white">
              <rect x="1" y="1" width="5" height="5" rx="1"/>
              <rect x="8" y="1" width="5" height="5" rx="1"/>
              <rect x="1" y="8" width="5" height="5" rx="1"/>
              <rect x="8" y="8" width="5" height="5" rx="1"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>DocVault</span>
        </div>

        <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
          {isSignUp ? "Create an account" : "Welcome back"}
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
          {isSignUp ? "Start storing your files securely." : "Sign in to access your vault."}
        </div>

        {/* Form — note we use onSubmit on the form, not onClick on the button,
            so pressing Enter in any field also triggers it */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 5 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              style={{
                width: "100%", padding: "9px 12px", fontSize: 13,
                borderRadius: 8, border: "1px solid #e2e8f0",
                color: "#0f172a", outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0F6E56")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 5 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: "100%", padding: "9px 12px", fontSize: 13,
                borderRadius: 8, border: "1px solid #e2e8f0",
                color: "#0f172a", outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0F6E56")}
              onBlur={(e)  => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              fontSize: 12, color: "#A32D2D",
              background: "#FCEBEB", borderRadius: 8, padding: "8px 12px",
            }}>{error}</div>
          )}

          {/* Success message */}
          {message && (
            <div style={{
              fontSize: 12, color: "#085041",
              background: "#E1F5EE", borderRadius: 8, padding: "8px 12px",
            }}>{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px", fontSize: 14, fontWeight: 600,
              borderRadius: 8, border: "none",
              background: loading ? "#94a3b8" : "#0F6E56",
              color: "white", cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4, transition: "background 0.15s",
            }}
          >{loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button>
        </form>

        {/* Toggle between sign in / sign up */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748b" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#0F6E56", fontWeight: 600, fontSize: 13, padding: 0,
            }}
          >{isSignUp ? "Sign in" : "Sign up"}</button>
        </div>
      </div>
    </div>
  );
}
