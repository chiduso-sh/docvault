// FileCard.jsx
// Renders a single file in the card grid.
// Receives the file object plus action callbacks as props.

const BADGE_STYLES = {
  PDF: { bg: "#FCEBEB", color: "#A32D2D" },
  DOC: { bg: "#E6F1FB", color: "#185FA5" },
  XLS: { bg: "#E1F5EE", color: "#0F6E56" },
  IMG: { bg: "#EAF3DE", color: "#3B6D11" },
};

// Props destructuring: instead of writing `props.file`, `props.onStar`,
// we pull them out directly in the parameter list.
export default function FileCard({ file, onStar, onDelete }) {
  const badge = BADGE_STYLES[file.type] || BADGE_STYLES.DOC;

  return (
    <div
      style={{
        background: "white", border: "1px solid #e2e8f0",
        borderRadius: 12, padding: "12px 10px", cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
    >
      {/* Top row: type badge + action menu */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
          background: badge.bg, color: badge.color,
        }}>{file.type}</span>

        {/* Simple action row — star and delete */}
        <div style={{ display: "flex", gap: 6 }}>
          {/* onClick calls onStar which was passed from the parent.
              The parent (DocVault) decides what actually happens —
              this component doesn't know or care about Supabase. */}
          <button
            onClick={(e) => { e.stopPropagation(); onStar(file.id, file.starred); }}
            title={file.starred ? "Unstar" : "Star"}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, color: file.starred ? "#BA7517" : "#cbd5e1",
              padding: 0, lineHeight: 1,
            }}
          >★</button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(file.id, file.storagePath); }}
            title="Delete"
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "#f09595", padding: 0, lineHeight: 1,
            }}
          >✕</button>
        </div>
      </div>

      {/* Thumbnail area */}
      <div style={{
        width: "100%", height: 68, borderRadius: 6,
        background: "#f8fafc", border: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 10, fontSize: 11, fontWeight: 500, color: "#94a3b8",
      }}>{file.thumb}</div>

      {/* File name */}
      <div style={{
        fontSize: 12, fontWeight: 500, color: "#0f172a",
        lineHeight: 1.4, marginBottom: 4,
        // CSS text truncation: clip long names with an ellipsis
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{file.name}</div>

      {/* Meta: size · date */}
      <div style={{ fontSize: 11, color: "#94a3b8" }}>{file.size} · {file.date}</div>
    </div>
  );
}
