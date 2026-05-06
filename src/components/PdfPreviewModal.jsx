// PdfPreviewModal.jsx
// Renders a PDF inline using pdf.js — no new tab needed.
// Shows pages one at a time with prev/next navigation.

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// pdf.js needs a worker script to parse PDFs off the main thread.
// We point it to the CDN copy so we don't have to bundle it ourselves.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfPreviewModal({ file, signedUrl, onClose }) {
  const canvasRef    = useRef(null);
  const [pdf, setPdf]           = useState(null);   // loaded PDF document
  const [page, setPage]         = useState(1);       // current page number
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [scale, setScale]       = useState(1.2);     // zoom level

  // ── Load PDF document ──────────────────────────────────────────────
  // Runs once when the signedUrl is available.
  useEffect(() => {
    if (!signedUrl) return;
    setLoading(true);
    setError(null);

    pdfjsLib.getDocument(signedUrl).promise
      .then((loadedPdf) => {
        setPdf(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not load PDF: " + err.message);
        setLoading(false);
      });
  }, [signedUrl]);

  // ── Render current page onto canvas ───────────────────────────────
  // Re-runs whenever the pdf object, page number, or scale changes.
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false; // prevents race conditions if user pages quickly

    pdf.getPage(page).then((pdfPage) => {
      if (cancelled) return;

      const viewport = pdfPage.getViewport({ scale });
      const canvas   = canvasRef.current;
      const ctx      = canvas.getContext("2d");

      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      pdfPage.render({ canvasContext: ctx, viewport }).promise.catch(() => {});
    });

    return () => { cancelled = true; };
  }, [pdf, page, scale]);

  function prevPage() { setPage((p) => Math.max(1, p - 1)); }
  function nextPage() { setPage((p) => Math.min(totalPages, p + 1)); }
  function zoomIn()   { setScale((s) => Math.min(3, +(s + 0.2).toFixed(1))); }
  function zoomOut()  { setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(1))); }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">PDF</span>
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {/* Zoom controls */}
            <button onClick={zoomOut} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">−</button>
            <span className="text-xs text-slate-500 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn}  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">+</button>

            {/* Open in new tab */}
            <a
              href={signedUrl}
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm flex items-center justify-center hover:bg-slate-200 transition-colors"
              title="Open in new tab"
            >↗</a>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >✕</button>
          </div>
        </div>

        {/* Canvas area — scrollable */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-800 flex items-start justify-center p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading PDF…</p>
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mt-10">{error}</div>
          )}
          {!loading && !error && (
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-lg max-w-full"
            />
          )}
        </div>

        {/* Pagination footer */}
        {!loading && !error && totalPages > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={prevPage}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >← Prev</button>

            <span className="text-xs text-slate-500">
              Page <strong className="text-slate-800 dark:text-white">{page}</strong> of <strong className="text-slate-800 dark:text-white">{totalPages}</strong>
            </span>

            <button
              onClick={nextPage}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
