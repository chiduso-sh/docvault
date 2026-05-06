import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import DocVault      from "./components/DocVault";
import LoginPage     from "./components/LoginPage";
import ResetPassword from "./components/ResetPassword";

// Simple client-side router — checks the URL path and renders the
// right component. No react-router needed for just two routes.
function AppShell() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  // /reset-password is always accessible regardless of session state
  if (window.location.pathname === "/reset-password") {
    return <ResetPassword />;
  }

  return session ? <DocVault /> : <LoginPage />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  </StrictMode>
);
