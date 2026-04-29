import { useState, useRef } from "react";

export default function UploadModal({ collections, uploading, onUpload, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [collectionId, setCollectionId] = useState("");
  const [tag, setTag]                   = useState("");
  const [dragging, setDragging]         = useState(false);
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
    await onUpload(selectedFile, collectionId || null, tag || null);
    onClose();
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <h2 className="text-base font-semibold text-slate-900 mb-5">Upload file</h2>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 transition-colors
            ${dragging ? "border-brand bg-brand-light" : selectedFile ? "border-brand bg-brand-light/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}
        >
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} />
          {selectedFile ? (
            <div className="text-sm font-medium text-brand">
              {selectedFile.name}
              <span className="text-slate-400 font-normal ml-2">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Drop a file here or <span className="text-brand font-medium">browse</span></p>
          )}
        </div>

        {/* Collection */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-500 mb-1">Collection (optional)</label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-900 outline-none focus:border-brand bg-white"
          >
            <option value="">— None —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Tag */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-500 mb-1">Tag (optional)</label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. Exam prep"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-900 outline-none focus:border-brand"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
