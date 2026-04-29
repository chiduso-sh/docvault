// ShareModal.jsx
// Generates a signed URL for a file that anyone can use to download
// without logging in. Expires after 24 hours by default.

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ShareModal({ file, onClose }) {
  const [url, setUrl]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [expiry, setExpiry]   = useState(86400); // seconds — default 24h

  const EXPIRY_OPTIONS = [
    { label: "1 hour",   value: 3600 },
    { label: "24 hours", value: 86400 },
    { label: "7 days",   value: 604800 },
  ];

  async function generateLink() {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from("vault")
      .createSignedUrl(file.storagePath, expiry);

    if (error) {
      console.error(error);
    } else {
      setUrl(data.signedUrl);
    }
    setLoading(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Share file</h2>
        <p className="text-xs text-slate-400 mb-5 truncate">{file.name}</p>

        {/* Expiry selector */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Link expires after</label>
          <div className="flex gap-2">
            {EXPIRY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setExpiry(opt.value); setUrl(null); }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors
                  ${expiry === opt.value
                    ? "bg-brand text-white border-brand"
                    : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                  }`}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Generated URL */}
        {url ? (
          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Shareable link</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 outline-none truncate"
              />
              <button
                onClick={copyLink}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0
                  ${copied ? "bg-emerald-500 text-white" : "bg-brand text-white hover:bg-brand-dark"}`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Anyone with this link can download the file — no login required.
            </p>
          </div>
        ) : (
          <div className="mb-5 py-4 text-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
            Click "Generate link" to create a shareable URL
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
          >Close</button>
          <button
            onClick={generateLink}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-dark disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating…" : url ? "Regenerate" : "Generate link"}
          </button>
        </div>
      </div>
    </div>
  );
}
