function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
      <div className="skeleton h-6 w-1/2 bg-slate-100 rounded mb-2" />
      <div className="skeleton h-3 w-3/4 bg-slate-100 rounded" />
    </div>
  );
}

export default function StatsRow({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
        {[0,1,2,3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const cards = [
    { num: stats.total_files,            label: "Total files",    delta: `+${stats.files_this_week} this week` },
    { num: `${stats.storage_used_gb} GB`, label: "Storage used",  delta: `${stats.storage_pct}% of 5 GB` },
    { num: stats.pdf_count,              label: "PDFs",           delta: `+${stats.pdfs_this_week} this week` },
    { num: stats.collection_count,       label: "Collections",    delta: `${stats.shared_collections} shared` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-xl font-bold text-slate-900">{c.num}</div>
          <div className="text-xs text-slate-400 mt-0.5">{c.label}</div>
          <div className="text-xs text-brand mt-1">{c.delta}</div>
        </div>
      ))}
    </div>
  );
}
