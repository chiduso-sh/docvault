import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function inferType(mimeType = "") {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "XLS";
  if (mimeType.includes("image")) return "IMG";
  return "DOC";
}

export function useVault() {
  const [files, setFiles]             = useState([]);
  const [collections, setCollections] = useState([]);
  const [activity, setActivity]       = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchFiles = useCallback(async () => {
    const { data, error } = await supabase.from("files").select("*").order("created_at", { ascending: false });
    if (error) { setError(error.message); return; }
    setFiles(data.map((row) => ({
      id: row.id, name: row.name, type: inferType(row.mime_type),
      size: formatBytes(row.size_bytes), date: formatDate(row.created_at),
      thumb: row.page_count ? `${row.page_count} pages` : inferType(row.mime_type),
      tag: row.tag ?? "", starred: row.starred ?? false,
      storagePath: row.storage_path, mimeType: row.mime_type,
    })));
  }, []);

  const fetchCollections = useCallback(async () => {
    const { data, error } = await supabase.from("collections").select("id, name, color").order("name");
    if (error) { setError(error.message); return; }
    const withCounts = await Promise.all(
      data.map(async (col) => {
        const { count } = await supabase.from("files").select("*", { count: "exact", head: true }).eq("collection_id", col.id);
        return { ...col, count: `${count ?? 0} files` };
      })
    );
    setCollections(withCounts);
  }, []);

  const fetchActivity = useCallback(async () => {
    const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(10);
    if (error) { setError(error.message); return; }
    setActivity(data ?? []);
  }, []);

  const fetchStats = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_vault_stats");
    if (error) {
      const { count: totalFiles } = await supabase.from("files").select("*", { count: "exact", head: true });
      const { count: pdfCount }   = await supabase.from("files").select("*", { count: "exact", head: true }).ilike("mime_type", "%pdf%");
      const { count: colCount }   = await supabase.from("collections").select("*", { count: "exact", head: true });
      setStats({ total_files: totalFiles ?? 0, pdf_count: pdfCount ?? 0, collection_count: colCount ?? 0, shared_collections: 0, files_this_week: 0, pdfs_this_week: 0, storage_used_gb: 0, storage_pct: 0 });
      return;
    }
    setStats(data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchFiles(), fetchCollections(), fetchActivity(), fetchStats()]);
    setLoading(false);
  }, [fetchFiles, fetchCollections, fetchActivity, fetchStats]);

  const getFileUrl = useCallback(async (storagePath, mimeType) => {
    const { data, error } = await supabase.storage.from("vault").createSignedUrl(storagePath, 60);
    if (error) { showToast("Could not open file", "error"); return null; }
    if (mimeType?.includes("image") || mimeType?.includes("pdf")) {
      window.open(data.signedUrl, "_blank");
    } else {
      const a = document.createElement("a"); a.href = data.signedUrl; a.download = ""; a.click();
    }
    return data.signedUrl;
  }, [showToast]);

  const uploadFile = useCallback(async (file, collectionId, tag) => {
    setUploading(true); setError(null);
    try {
      const storagePath = `uploads/${Date.now()}_${file.name}`;
      const { error: storageError } = await supabase.storage.from("vault").upload(storagePath, file);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase.from("files").insert({
        name: file.name, mime_type: file.type, size_bytes: file.size,
        storage_path: storagePath, collection_id: collectionId ?? null, tag: tag ?? null,
      });
      if (dbError) throw dbError;
      await supabase.from("activity_log").insert({ icon: "+", message: `${file.name} uploaded`, detail: "" });
      await loadAll();
      showToast(`"${file.name}" uploaded successfully`);
    } catch (err) { setError(err.message); showToast(err.message, "error"); }
    finally { setUploading(false); }
  }, [loadAll, showToast]);

  const deleteFile = useCallback(async (fileId, storagePath, fileName) => {
    await supabase.storage.from("vault").remove([storagePath]);
    await supabase.from("files").delete().eq("id", fileId);
    await supabase.from("activity_log").insert({ icon: "✕", message: `${fileName} deleted`, detail: "" });
    await loadAll();
    showToast(`"${fileName}" deleted`);
  }, [loadAll, showToast]);

  const renameFile = useCallback(async (fileId, newName) => {
    const { error } = await supabase.from("files").update({ name: newName }).eq("id", fileId);
    if (error) { showToast("Rename failed", "error"); return; }
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, name: newName } : f));
    showToast("File renamed");
  }, [showToast]);

  const toggleStar = useCallback(async (fileId, currentStarred) => {
    await supabase.from("files").update({ starred: !currentStarred }).eq("id", fileId);
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, starred: !currentStarred } : f));
    showToast(currentStarred ? "Removed from starred" : "Added to starred");
  }, [showToast]);

  const updateTag = useCallback(async (fileId, tag) => {
    const { error } = await supabase.from("files").update({ tag }).eq("id", fileId);
    if (error) { showToast("Could not update tag", "error"); return; }
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, tag: tag ?? "" } : f));
    showToast(tag ? `Tag set to "${tag}"` : "Tag removed");
  }, [showToast]);

  const createCollection = useCallback(async (name, color) => {
    const { error } = await supabase.from("collections").insert({ name, color });
    if (error) { showToast("Could not create collection", "error"); return; }
    await fetchCollections();
    showToast(`Collection "${name}" created`);
  }, [fetchCollections, showToast]);

  useEffect(() => {
    loadAll();
    const channel = supabase
      .channel("vault-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "files" }, () => { fetchFiles(); fetchStats(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAll, fetchFiles, fetchStats]);

  return {
    files, collections, activity, stats,
    loading, uploading, error, toast,
    uploadFile, deleteFile, renameFile,
    toggleStar, getFileUrl, createCollection, updateTag,
  };
}
