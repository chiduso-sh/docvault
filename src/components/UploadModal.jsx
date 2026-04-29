// UploadModal.jsx
// A modal dialog for picking a file and uploading it.
// Uses an uncontrolled file input (the browser manages its own value).

import { useState, useRef } from "react";

export default function UploadModal({ collections, uploading, onUpload, onClose }) {
  // Local state — only this component cares about which file is picked
  // and which collection/tag the user chose before submitting.
  const [selectedFile, setSelectedFile] = useState(null);
  const [collectionId, setCollectionId] = useState("");
  const [tag, setTag]                   = useState("");

  // useRef gives a direct reference to a DOM element without triggering
  // a re-render. Here we use it to programmatically click the hidden
  // file input when the user clicks the styled drop zone.
  const fileInputRef = useRef(null);

  function handleFilePick(e) {
    // e.target.files is a FileList — we grab index [0] for the first file
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  }

  function handleDrop(e) {
    // preventDefault stops the browser from navigating to the dropped file
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }

  async function handleSubmit() {
    if (!selectedFile) return;
    // Delegate the actual upload to the parent — it owns the Supabase logic
    await onUpload(selectedFile, collectionId || null, tag || null);
    onClose();
  }

  return (
    // Backdrop — clicking outside the modal closes it
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,                        // covers the entire viewport
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50,
      }}
    >
      {/* Modal box — stopPropagation prevents the backdrop click from firing */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 16, padding: 28,
          width: 440, maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>
          Upload file
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}  // required to allow drop
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{
            border: "2px dashed #e2e8f0", borderRadius: 12,
            padding: "32px 20px", textAlign: "center",
            cursor: "pointer", marginBottom: 16,
            background: selectedFile ? "#f0fdf4" : "#f8fafc",
            transition: "background 0.15s",
          }}
        >
          {/* Hidden native file input — triggered by the drop zone click */}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFilePick}
          />
          {selectedFile ? (
            <div style={{ fontSize: 13, color: "#0F6E56", fontWeight: 500 }}>
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              Drop a file here or click to browse
            </div>
          )}
        </div>

        {/* Collection picker */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>
            Collection (optional)
          </label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            style={{
              width: "100%", padding: "8px 10px", fontSize: 13,
              borderRadius: 8, border: "1px solid #e2e8f0",
              background: "white", color: "#0f172a", outline: "none",
            }}
          >
            <option value="">— None —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Tag input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>
            Tag (optional)
          </label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. Exam prep"
            style={{
              width: "100%", padding: "8px 10px", fontSize: 13,
              borderRadius: 8, border: "1px solid #e2e8f0",
              color: "#0f172a", outline: "none",
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px", fontSize: 13, borderRadius: 8,
              border: "1px solid #e2e8f0", background: "white",
              color: "#64748b", cursor: "pointer",
            }}
          >Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            style={{
              padding: "8px 20px", fontSize: 13, fontWeight: 600,
              borderRadius: 8, border: "none",
              background: !selectedFile || uploading ? "#94a3b8" : "#0F6E56",
              color: "white", cursor: !selectedFile || uploading ? "not-allowed" : "pointer",
            }}
          >{uploading ? "Uploading…" : "Upload"}</button>
        </div>
      </div>
    </div>
  );
}
