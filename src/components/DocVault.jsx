// DocVault.jsx  — root component
// Owns the UI state (search, active tab/tag, modal open/close).
// Delegates ALL data fetching and mutations to the useVault hook.

import { useState } from "react";
import { useVault }    from "../hooks/useVault";
import Header          from "./Header";
import StatsRow        from "./StatsRow";
import FileCard        from "./FileCard";
import RightPanel      from "./RightPanel";
import UploadModal     from "./UploadModal";

export default function DocVault() {
  // ── UI-only state (no server contact needed) ───────────────────────
  const [activeTab,   setActiveTab]   = useState("Overview");
  const [activeTag,   setActiveTag]   = useState(null);
  const [search,      setSearch]      = useState("");
  const [showUpload,  setShowUpload]  = useState(false);

  // ── Server state — all comes from the custom hook ──────────────────
  // Destructuring: pull named values out of the object the hook returns.
  const {
    files, collections, activity, stats,
    loading, uploading, error,
    uploadFile, deleteFile, toggleStar,
  } = useVault();

  // ── Derived data (computed from existing state, no useState needed) ─
  // Filtering is pure JS — no extra state, no useEffect required.
  // This runs on every render; for huge lists you'd wrap in useMemo.
  const visibleFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag    = !activeTag || f.tag === activeTag;
    const matchesTab    = activeTab === "Starred" ? f.starred : true;
    return matchesSearch && matchesTag && matchesTab;
  });

  // ── Error banner ───────────────────────────────────────────────────
  // Conditional rendering: JSX can return null to render nothing,
  // or a real element. The && short-circuit pattern is common in React.
  if (error) {
    return (
      <div style={{
        padding: 16, background: "#FCEBEB", color: "#A32D2D",
        borderRadius: 10, fontSize: 13,
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    // React.Fragment shorthand (<>) — lets you return multiple elements
    // without adding an extra wrapper div to the DOM.
    <>
      <div style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        border: "1px solid #e2e8f0", borderRadius: 16,
        overflow: "hidden", background: "#f8fafc", minHeight: 600,
      }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        {/* Props flow downward (parent → child). The parent passes
            state values AND setter callbacks so the child can report
            changes back up — this is called "lifting state up". */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          onUploadClick={() => setShowUpload(true)}
        />

        {/* ── Body ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", background: "#f8fafc" }}>

          {/* ── Main content ───────────────────────────────────── */}
          <div style={{ flex: 1, padding: 20, minWidth: 0 }}>

            <StatsRow stats={stats} loading={loading} />

            {/* Section label */}
            <div style={{
              fontSize: 11, fontWeight: 600, color: "#94a3b8",
              letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
            }}>
              {search ? `Results for "${search}"` : "Recently added"}
            </div>

            {/* Loading skeleton for file cards */}
            {loading ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 10, marginBottom: 20,
              }}>
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} style={{
                    height: 140, background: "white",
                    border: "1px solid #e2e8f0", borderRadius: 12,
                  }} />
                ))}
              </div>
            ) : visibleFiles.length === 0 ? (
              // Empty state
              <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                No files found.
              </div>
            ) : (
              // File card grid
              // `gap` in CSS Grid creates space between cells without
              // adding margin to outer edges — cleaner than margin hacks.
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 10, marginBottom: 20,
              }}>
                {visibleFiles.map((file) => (
                  // Each FileCard receives only what it needs.
                  // The callbacks (onStar, onDelete) are defined here and
                  // passed down — FileCard never touches Supabase directly.
                  <FileCard
                    key={file.id}
                    file={file}
                    onStar={toggleStar}
                    onDelete={deleteFile}
                  />
                ))}
              </div>
            )}

            {/* Collections list */}
            <div style={{
              fontSize: 11, fontWeight: 600, color: "#94a3b8",
              letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
            }}>Collections</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {collections.map((c) => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", background: "white",
                  border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: "#0f172a", flex: 1 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel ────────────────────────────────────── */}
          <RightPanel
            activity={activity}
            activeTag={activeTag}
            onTagChange={setActiveTag}
          />
        </div>
      </div>

      {/* ── Upload modal ─────────────────────────────────────────── */}
      {/* Conditional rendering: only mount the modal when showUpload is true.
          When false, the component is fully removed from the DOM. */}
      {showUpload && (
        <UploadModal
          collections={collections}
          uploading={uploading}
          onUpload={uploadFile}
          onClose={() => setShowUpload(false)}
        />
      )}
    </>
  );
}
