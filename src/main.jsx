// src/main.jsx
// This is the app entry point. It wraps everything in AuthProvider
// so any component can access the session via useAuth().

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import DocVault   from "./components/DocVault";
import LoginPage  from "./components/LoginPage";

// AppShell decides what to render based on auth state.
// This is called a "route guard" — unauthenticated users see LoginPage,
// authenticated users see DocVault.
function AppShell() {
  const { session, loading } = useAuth();

  // While checking for an existing session, show nothing (avoids flash)
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", fontSize: 14,
      }}>
        Loading…
      </div>
    );
  }

  // session is null when not logged in → show login
  // session has a value when logged in → show the vault
  return session ? <DocVault /> : <LoginPage />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  </StrictMode>
);
