import { useState } from "react";

const COLORS = ["#534AB7","#185FA5","#0F6E56","#BA7517","#A32D2D","#7C3D8E","#1A6B5E","#C45E1A"];

export default function CollectionModal({ onSave, onClose }) {
  const [name, setName]   = useState("");
  const [color, setColor] = useState(COLORS[0]);

  function handleSubmit() {
    if (!name.trim()) return;
    onSave(name.trim(), color);
    onClose();
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
      >
        <h2 className="text-base font-semibold text-slate-900 mb-5">New collection</h2>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. CPE 461"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-900 outline-none focus:border-brand"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-500 mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ background: c }}
                className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-slate-700" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
