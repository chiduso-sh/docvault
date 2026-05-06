import { useState, useRef } from "react";

export default function UploadModal({ collections, uploading, onUpload, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [collectionId, setCollectionId] = useState("");
  const [tag, setTag]                   = useState("");
  const [dragging, setDragging]         = useState(false);
  const [progress, setProgress]         = useState(0); // 0–100
  const fileInputRef = useRef(null);

  function handleFilePick(e) {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }

  async function handleSubmit() {
    if (!selectedFile) return;

    // Simulate progress in steps while the real upload runs in parallel.
    // We tick up to 90% quickly, then wait for the actual upload to finish
    // before jumping to 100%.
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 15;
      });
    }, 200);

    await onUpload(selectedFile, collectionId || null, tag || null);

    clearInterval(interval);
    setProgress(100);
    setTimeout(onClose, 400); // brief pause so user sees 100%
  }

  const progressClamped = Math.min(100, Math.round(progress));

  return (
    <div onClick={!uploading ? onClose : undefined} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Upload file</h2>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-colors
            ${uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
            ${dragging ? "border-brand bg-brand-light" : selectedFile ? "border-brand bg-brand-light/50" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"}`}
        >
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} disabled={uploading} />
          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-brand">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Drop a file here or <span className="text-brand font-medium">browse</span></p>
          )}
        </div>

        {/* Progress bar — only shown while uploading */}
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Uploading…</span>
              <span>{progressClamped}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-200"
                style={{ width: `${progressClamped}%` }}
              />
            </div>
          </div>
        )}

        {/* Collection */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Collection (optional)</label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            disabled={uploading}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:border-brand bg-white dark:bg-slate-700 disabled:opacity-50"
          >
            <option value="">— None —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Tag */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tag (optional)</label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. Exam prep"
            disabled={uploading}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:border-brand bg-white dark:bg-slate-700 disabled:opacity-50"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40"
          >Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors"
          >
            {uploading ? `Uploading ${progressClamped}%` : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
