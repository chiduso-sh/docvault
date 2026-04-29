// Header.jsx
// Receives all its data as props — it owns no state of its own.
// This is called a "controlled" or "presentational" component.

import { useAuth } from "../lib/AuthContext";

const TABS = ["Overview", "My files", "Shared", "Starred", "Trash"];

export default function Header({ activeTab, onTabChange, search, onSearchChange, onUploadClick }) {
  const { signOut, session } = useAuth();

  return (
    <div style={{ background: "#0F6E56", padding: "20px 24px 0" }}>

      {/* ── Top bar: brand + search + action buttons ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>

        {/* Brand logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="1" y="1" width="5" height="5" rx="1" />
              <rect x="8" y="1" width="5" height="5" rx="1" />
              <rect x="1" y="8" width="5" height="5" rx="1" />
              <rect x="8" y="8" width="5" height="5" rx="1" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "white" }}>DocVault</span>
        </div>

        {/* Controlled search input
            "Controlled" means React drives the value — it always matches
            the `search` state. Every keystroke calls onSearchChange which
            updates state in the parent, which re-renders this input. */}
        <div style={{ flex: 1, maxWidth: 400, margin: "0 auto", position: "relative" }}>
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.55)", fontSize: 15, pointerEvents: "none",
          }}>⌕</span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search everything..."
            style={{
              width: "100%", padding: "8px 14px 8px 36px", fontSize: 13,
              borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.12)", color: "white", outline: "none",
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button style={{
            padding: "6px 14px", fontSize: 12, fontWeight: 500, borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer",
          }}>Filter</button>

          {/* onUploadClick is passed down from the parent — the parent
              decides what happens (open a modal, trigger file picker, etc.) */}
          <button
            onClick={onUploadClick}
            style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8,
              border: "none", background: "white", color: "#0F6E56", cursor: "pointer",
            }}
          >+ New upload</button>

          <button
            onClick={signOut}
            title={session?.user?.email}
            style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 500, borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
            }}
          >Sign out</button>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div style={{ display: "flex" }}>
        {TABS.map((tab) => (
          <button
            key={tab}                         // key helps React track list items efficiently
            onClick={() => onTabChange(tab)}
            style={{
              padding: "10px 18px", fontSize: 13, cursor: "pointer",
              background: "none", border: "none", outline: "none",
              color: activeTab === tab ? "white" : "rgba(255,255,255,0.55)",
              fontWeight: activeTab === tab ? 600 : 400,
              // Ternary operator: condition ? valueIfTrue : valueIfFalse
              borderBottom: activeTab === tab ? "2px solid white" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >{tab}</button>
        ))}
      </div>
    </div>
  );
}
