const TAGS = ["Exam prep","Reference","Summary","Assignment","Lecture notes","Past questions","Circuit","Code"];

function ActivityPanel({ activity }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900 mb-3">Recent activity</p>
      {activity.length === 0 && (
        <p className="text-xs text-slate-400">No recent activity.</p>
      )}
      {activity.map((a, i) => (
        <div key={i} className="flex gap-2.5 mb-3 items-start">
          <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-xs text-slate-500 shrink-0">
            {a.icon}
          </div>
          <div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800 font-medium">{a.message}</strong>
              {a.detail ? ` ${a.detail}` : ""}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TagCloud({ activeTag, onTagChange }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900 mb-3">Filter by tag</p>
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map((tag) => {
          const active = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onTagChange(active ? null : tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                ${active
                  ? "bg-brand-light text-brand-dark border-emerald-300"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
            >{tag}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function RightPanel({ activity, activeTag, onTagChange }) {
  return (
    <aside className="hidden lg:block w-60 shrink-0 border-l border-slate-200 bg-white p-4 space-y-5">
      <ActivityPanel activity={activity} />
      <hr className="border-slate-100" />
      <TagCloud activeTag={activeTag} onTagChange={onTagChange} />
    </aside>
  );
}
