// RightPanel.jsx
// Combines the activity feed and tag filter cloud into one sidebar panel.

// ── ActivityPanel ────────────────────────────────────────────────────
// Renders the list of recent actions fetched from activity_log.
function ActivityPanel({ activity }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 14 }}>
        Recent activity
      </div>

      {activity.length === 0 && (
        <p style={{ fontSize: 12, color: "#94a3b8" }}>No recent activity.</p>
      )}

      {/* activity.map() — iterates the array and returns one JSX element
          per item. The `index` (i) is used as the key here because activity
          items have no stable ID in this schema. If they had IDs use those. */}
      {activity.map((a, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#f8fafc", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, flexShrink: 0, color: "#64748b",
          }}>{a.icon}</div>
          <div>
            {/* Template literal: backtick string that embeds variables with ${} */}
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
              <strong>{a.message}</strong>
              {a.detail ? ` ${a.detail}` : ""}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {new Date(a.created_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric",
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TagCloud ─────────────────────────────────────────────────────────
// Renders clickable tag pills. Calls onTagChange when a tag is clicked.
// The parent decides whether to toggle or replace the active tag.
const TAGS = [
  "Exam prep", "Reference", "Summary", "Assignment",
  "Lecture notes", "Past questions", "Circuit", "Code",
];

function TagCloud({ activeTag, onTagChange }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>
        Filter by tag
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {TAGS.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              // Toggle: if it's already active, pass null to clear; else select it
              onClick={() => onTagChange(isActive ? null : tag)}
              style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 20,
                border: "1px solid",
                borderColor: isActive ? "#5DCAA5" : "#e2e8f0",
                background:  isActive ? "#E1F5EE" : "#f8fafc",
                color:       isActive ? "#085041" : "#64748b",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >{tag}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── RightPanel ───────────────────────────────────────────────────────
// The exported component that combines both sub-components.
export default function RightPanel({ activity, activeTag, onTagChange }) {
  return (
    <div style={{
      width: 250, minWidth: 250, padding: 20,
      borderLeft: "1px solid #e2e8f0", background: "white",
    }}>
      <ActivityPanel activity={activity} />
      <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />
      <TagCloud activeTag={activeTag} onTagChange={onTagChange} />
    </div>
  );
}
