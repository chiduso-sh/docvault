import { useState } from "react";

const BADGE = {
  PDF: "bg-red-50 text-red-700",
  DOC: "bg-blue-50 text-blue-700",
  XLS: "bg-emerald-50 text-emerald-700",
  IMG: "bg-green-50 text-green-700",
};

export default function FileCard({ file, onStar, onDelete, onOpen, onRename }) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName]   = useState(file.name);

  function submitRename() {
    if (newName.trim() && newName !== file.name) onRename(file.id, newName.trim());
    setRenaming(false);
  }

  return (
    <div
      onClick={() => !renaming && onOpen(file.storagePath, file.mimeType)}
      className="bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-slate-400 transition-colors group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE[file.type] ?? BADGE.DOC}`}>
          {file.type}
        </span>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onStar(file.id, file.starred); }}
            className={`text-sm leading-none ${file.starred ? "text-amber-500" : "text-slate-300 hover:text-amber-400"} transition-colors`}
          >★</button>
          <button
            onClick={(e) => { e.stopPropagation(); setRenaming(true); setNewName(file.name); }}
            className="text-xs leading-none text-slate-300 hover:text-slate-500 transition-colors"
          >✎</button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(file.id, file.storagePath, file.name); }}
            className="text-xs leading-none text-red-300 hover:text-red-500 transition-colors"
          >✕</button>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="w-full h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-medium text-slate-400 mb-2.5">
        {file.thumb}
      </div>

      {/* Name / rename input */}
      {renaming ? (
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={submitRename}
          onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(false); }}
          onClick={(e) => e.stopPropagation()}
          className="w-full text-xs font-medium text-slate-900 border border-brand rounded px-1 py-0.5 outline-none mb-1"
        />
      ) : (
        <div className="text-xs font-medium text-slate-900 truncate mb-1">{file.name}</div>
      )}

      <div className="text-[11px] text-slate-400">{file.size} · {file.date}</div>
    </div>
  );
}
