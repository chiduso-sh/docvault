// TagModal.jsx — edit the tag on an existing file

import { useState } from "react";

const PRESET_TAGS = [
  "Exam prep", "Reference", "Summary", "Assignment",
  "Lecture notes", "Past questions", "Circuit", "Code",
];

export default function TagModal({ file, onSave, onClose }) {
  const [tag, setTag] = useState(file.tag ?? "");

  function handleSave() {
    onSave(file.id, tag.trim() || null);
    onClose();
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Edit tag</h2>
        <p className="text-xs text-slate-400 mb-5 truncate">{file.name}</p>

        {/* Preset tag pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {PRESET_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                ${tag === t
                  ? "bg-brand text-white border-brand"
                  : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                }`}
            >{t}</button>
          ))}
        </div>

        {/* Custom tag input */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Or type a custom tag
          </label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. Thesis"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand"
          />
        </div>

        {/* Clear tag option */}
        {file.tag && (
          <button
            onClick={() => { onSave(file.id, null); onClose(); }}
            className="text-xs text-red-400 hover:text-red-600 mb-4 block"
          >
            Remove current tag ({file.tag})
          </button>
        )}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors"
          >
            Save tag
          </button>
        </div>
      </div>
    </div>
  );
}
