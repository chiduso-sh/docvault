import { useState } from "react";
import { useVault }        from "../hooks/useVault";
import { useDarkMode }     from "../lib/useDarkMode";
import Header              from "./Header";
import StatsRow            from "./StatsRow";
import FileCard            from "./FileCard";
import RightPanel          from "./RightPanel";
import UploadModal         from "./UploadModal";
import Toast               from "./Toast";
import CollectionModal     from "./CollectionModal";
import ShareModal          from "./ShareModal";
import TagModal            from "./TagModal";
import PdfPreviewModal     from "./PdfPreviewModal";

export default function DocVault() {
  const [dark, setDark]                           = useDarkMode();
  const [activeTab, setActiveTab]                 = useState("Overview");
  const [activeTag, setActiveTag]                 = useState(null);
  const [search, setSearch]                       = useState("");
  const [showUpload, setShowUpload]               = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [shareFile, setShareFile]                 = useState(null);
  const [tagFile, setTagFile]                     = useState(null);
  const [pdfPreview, setPdfPreview]               = useState(null); // { file, signedUrl }

  const {
    files, collections, activity, stats,
    loading, uploading, error, toast,
    uploadFile, deleteFile, renameFile,
    toggleStar, getFileUrl, getSignedUrl,
    createCollection, updateTag,
  } = useVault();

  // ── Handle file card click ────────────────────────────────────────
  // PDFs open in the preview modal; everything else uses the original
  // getFileUrl behaviour (open in tab or download).
  async function handleOpen(storagePath, mimeType) {
    if (mimeType?.includes("pdf")) {
      const url = await getSignedUrl(storagePath);
      if (!url) return;
      const file = files.find((f) => f.storagePath === storagePath);
      setPdfPreview({ file, signedUrl: url });
    } else {
      getFileUrl(storagePath, mimeType);
    }
  }

  const visibleFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag    = !activeTag || f.tag === activeTag;
    const matchesTab    = activeTab === "Starred" ? f.starred : true;
    return matchesSearch && matchesTag && matchesTab;
  });

  return (
    <>
      <div className="min-h-screen sm:min-h-0 sm:rounded-2xl sm:border sm:border-white/10 overflow-hidden bg-white/10 dark:bg-black/20 backdrop-blur-sm">

        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          onUploadClick={() => setShowUpload(true)}
          dark={dark}
          onToggleDark={() => setDark(!dark)}
        />

        <div className="flex">
          <main className="flex-1 p-4 sm:p-5 min-w-0">

            <StatsRow stats={stats} loading={loading} />

            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {search ? `Results for "${search}"` : activeTab === "Starred" ? "Starred files" : "Recently added"}
            </p>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</div>
            )}

            {/* File grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 mb-5">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className="skeleton h-36 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl" />
                ))}
              </div>
            ) : visibleFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-white/60 dark:bg-white/5 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-14 px-6 mb-5 text-center">
                <span className="text-4xl mb-3">📂</span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                  {search ? "No files match your search" : activeTab === "Starred" ? "No starred files yet" : "No files yet"}
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  {search ? "Try a different search term" : "Upload your first file to get started"}
                </p>
                {!search && (
                  <button onClick={() => setShowUpload(true)} className="px-4 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
                    + Upload file
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 mb-5">
                {visibleFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onStar={toggleStar}
                    onDelete={deleteFile}
                    onOpen={handleOpen}
                    onRename={renameFile}
                    onShare={(f) => setShareFile(f)}
                    onTag={(f) => setTagFile(f)}
                  />
                ))}
              </div>
            )}

            {/* Collections */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Collections</p>
              <button
                onClick={() => setShowNewCollection(true)}
                className="text-xs font-semibold text-brand border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-white/5 px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10"
              >+ New</button>
            </div>

            {collections.length === 0 && !loading ? (
              <div className="text-center bg-white/60 dark:bg-white/5 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-5 text-xs text-slate-400">
                No collections yet. Create one to organise your files.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {collections.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-colors">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-sm text-slate-800 dark:text-slate-200 flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400 shrink-0">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </main>

          <RightPanel activity={activity} activeTag={activeTag} onTagChange={setActiveTag} />
        </div>
      </div>

      {showUpload       && <UploadModal collections={collections} uploading={uploading} onUpload={uploadFile} onClose={() => setShowUpload(false)} />}
      {showNewCollection && <CollectionModal onSave={createCollection} onClose={() => setShowNewCollection(false)} />}
      {shareFile        && <ShareModal file={shareFile} onClose={() => setShareFile(null)} />}
      {tagFile          && <TagModal file={tagFile} onSave={updateTag} onClose={() => setTagFile(null)} />}
      {pdfPreview       && <PdfPreviewModal file={pdfPreview.file} signedUrl={pdfPreview.signedUrl} onClose={() => setPdfPreview(null)} />}

      <Toast toast={toast} />
    </>
  );
}
