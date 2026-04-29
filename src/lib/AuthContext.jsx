// src/lib/AuthContext.jsx
// React Context lets you share data (here: the logged-in user session)
// across the entire component tree without passing it as props at every level.

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

// Step 1 — create the context object with a default value of null
const AuthContext = createContext(null);

// Step 2 — AuthProvider wraps the whole app and makes session available everywhere
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);   // null = not logged in
  const [loading, setLoading] = useState(true);   // true while we check existing session

  useEffect(() => {
    // On mount: check if there's already a session saved in the browser
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Subscribe to auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    // Cleanup: unsubscribe when provider unmounts
    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  return (
    // Step 3 — provide session, loading state, and signOut to all children
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 4 — custom hook so any component can access auth with one line:
// const { session, signOut } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
