import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import DocVault  from "./components/DocVault";
import LoginPage from "./components/LoginPage";

function AppShell() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
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
