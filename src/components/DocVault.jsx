import { useState } from "react";
import { useVault }        from "../hooks/useVault";
import Header              from "./Header";
import StatsRow            from "./StatsRow";
import FileCard            from "./FileCard";
import RightPanel          from "./RightPanel";
import UploadModal         from "./UploadModal";
import Toast               from "./Toast";
import CollectionModal     from "./CollectionModal";

export default function DocVault() {
  const [activeTab,         setActiveTab]         = useState("Overview");
  const [activeTag,         setActiveTag]         = useState(null);
  const [search,            setSearch]            = useState("");
  const [showUpload,        setShowUpload]        = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);

  const {
    files, collections, activity, stats,
    loading, uploading, error, toast,
    uploadFile, deleteFile, renameFile,
    toggleStar, getFileUrl, createCollection,
  } = useVault();

  const visibleFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag    = !activeTag || f.tag === activeTag;
    const matchesTab    = activeTab === "Starred" ? f.starred : true;
    return matchesSearch && matchesTag && matchesTab;
  });

  return (
    <>
      <div className="min-h-screen sm:min-h-0 sm:rounded-2xl sm:border sm:border-slate-200 overflow-hidden bg-slate-50">

        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          onUploadClick={() => setShowUpload(true)}
        />

        <div className="flex">

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-5 min-w-0">

            <StatsRow stats={stats} loading={loading} />

            {/* Section heading */}
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {search ? `Results for "${search}"` : activeTab === "Starred" ? "Starred files" : "Recently added"}
            </p>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</div>
            )}

            {/* File grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 mb-5">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className="skeleton h-36 bg-white border border-slate-200 rounded-xl" />
                ))}
              </div>
            ) : visibleFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-2xl py-14 px-6 mb-5 text-center">
                <span className="text-4xl mb-3">📂</span>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  {search ? "No files match your search" : activeTab === "Starred" ? "No starred files yet" : "No files yet"}
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  {search ? "Try a different search term" : "Upload your first file to get started"}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-4 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
                  >+ Upload file</button>
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
                    onOpen={getFileUrl}
                    onRename={renameFile}
                  />
                ))}
              </div>
            )}

            {/* Collections */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Collections</p>
              <button
                onClick={() => setShowNewCollection(true)}
                className="text-xs font-semibold text-brand border border-slate-200 bg-white px-2.5 py-1 rounded-lg hover:bg-slate-50"
              >+ New</button>
            </div>

            {collections.length === 0 && !loading ? (
              <div className="text-center bg-white border border-dashed border-slate-200 rounded-xl py-5 text-xs text-slate-400">
                No collections yet. Create one to organise your files.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {collections.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-sm text-slate-800 flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400 shrink-0">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right panel — hidden below lg */}
          <RightPanel activity={activity} activeTag={activeTag} onTagChange={setActiveTag} />
        </div>
      </div>

      {showUpload && (
        <UploadModal
          collections={collections}
          uploading={uploading}
          onUpload={uploadFile}
          onClose={() => setShowUpload(false)}
        />
      )}

      {showNewCollection && (
        <CollectionModal
          onSave={createCollection}
          onClose={() => setShowNewCollection(false)}
        />
      )}

      <Toast toast={toast} />
    </>
  );
}
