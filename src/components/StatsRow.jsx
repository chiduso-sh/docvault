// StatsRow.jsx
// Pure presentational component — receives `stats` from Supabase
// (or null while loading) and renders four metric cards.

// Skeleton card shown while data is still loading
function SkeletonCard() {
  return (
    <div style={{
      background: "white", border: "1px solid #e2e8f0",
      borderRadius: 10, padding: "12px 14px",
    }}>
      {/* Animated grey bars simulate loading content */}
      <div style={{ width: "50%", height: 24, background: "#f1f5f9", borderRadius: 4, marginBottom: 6,
        animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ width: "70%", height: 11, background: "#f1f5f9", borderRadius: 4 }} />
    </div>
  );
}

export default function StatsRow({ stats, loading }) {
  // While loading, render 4 skeleton placeholders
  if (loading || !stats) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  // stats is the object returned by the Supabase RPC `get_vault_stats`
  // Expected shape: { total_files, storage_used_gb, pdf_count, collection_count,
  //                   files_this_week, pdfs_this_week, shared_collections }
  const cards = [
    { num: stats.total_files,        label: "Total files",    delta: `+${stats.files_this_week} this week` },
    { num: `${stats.storage_used_gb} GB`, label: "Storage used", delta: `${stats.storage_pct}% of 5 GB` },
    { num: stats.pdf_count,          label: "PDFs",           delta: `+${stats.pdfs_this_week} this week` },
    { num: stats.collection_count,   label: "Collections",    delta: `${stats.shared_collections} shared` },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
      {cards.map((c) => (
        <div key={c.label} style={{
          background: "white", border: "1px solid #e2e8f0",
          borderRadius: 10, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{c.num}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{c.label}</div>
          <div style={{ fontSize: 11, color: "#0F6E56", marginTop: 4 }}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}
