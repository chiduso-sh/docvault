import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ------------------------------------------------------------------
// formatBytes  — converts raw byte count into a readable string
// e.g. 4400000 → "4.2 MB"
// ------------------------------------------------------------------
function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// ------------------------------------------------------------------
// formatDate  — turns an ISO timestamp into "Apr 25" style
// ------------------------------------------------------------------
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ------------------------------------------------------------------
// inferType  — guesses the file type badge from the file's MIME type
// ------------------------------------------------------------------
function inferType(mimeType = "") {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "XLS";
  if (mimeType.includes("image")) return "IMG";
  return "DOC";
}

// ------------------------------------------------------------------
// useVault  — the main custom hook that owns all vault state
//
// A custom hook is just a plain JS function whose name starts with
// "use". It can call other hooks (useState, useEffect, etc.) and
// returns whatever data/functions the component needs.
// ------------------------------------------------------------------
export function useVault() {
  // ---- state -------------------------------------------------------
  const [files, setFiles]           = useState([]);   // array of file records from DB
  const [collections, setCollections] = useState([]); // array of collection records
  const [activity, setActivity]     = useState([]);   // recent activity log
  const [stats, setStats]           = useState(null); // aggregate counts
  const [loading, setLoading]       = useState(true); // true while first fetch runs
  const [uploading, setUploading]   = useState(false);// true while a file uploads
  const [error, setError]           = useState(null); // holds any error message

  // ---- fetchFiles --------------------------------------------------
  // Queries the `files` table, ordered by newest first.
  // We wrap it in useCallback so it has a stable reference and can be
  // passed to child components or called after an upload without
  // creating a new function object on every render.
  const fetchFiles = useCallback(async () => {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    // Transform raw DB rows into the shape the UI expects
    const shaped = data.map((row) => ({
      id:        row.id,
      name:      row.name,
      type:      inferType(row.mime_type),
      size:      formatBytes(row.size_bytes),
      date:      formatDate(row.created_at),
      thumb:     row.page_count ? `${row.page_count} pages` : inferType(row.mime_type),
      tag:       row.tag ?? "",
      starred:   row.starred ?? false,
      storagePath: row.storage_path,
    }));

    setFiles(shaped);
  }, []);

  // ---- fetchCollections --------------------------------------------
  const fetchCollections = useCallback(async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("id, name, color, files(count)")   // join to count related files
      .order("name");

    if (error) { setError(error.message); return; }

    const shaped = data.map((col) => ({
      id:    col.id,
      name:  col.name,
      color: col.color,
      count: `${col.files[0]?.count ?? 0} files`,
    }));

    setCollections(shaped);
  }, []);

  // ---- fetchActivity -----------------------------------------------
  const fetchActivity = useCallback(async () => {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) { setError(error.message); return; }
    setActivity(data ?? []);
  }, []);

  // ---- fetchStats --------------------------------------------------
  // Uses a Supabase RPC (remote procedure call) — a SQL function you
  // define once in Supabase and call by name from the client.
  const fetchStats = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_vault_stats");
    if (error) { setError(error.message); return; }
    setStats(data);
  }, []);

  // ---- loadAll -----------------------------------------------------
  // Runs all four fetches in parallel using Promise.all, then clears
  // the loading flag. Promise.all waits for every promise to settle.
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchFiles(), fetchCollections(), fetchActivity(), fetchStats()]);
    setLoading(false);
  }, [fetchFiles, fetchCollections, fetchActivity, fetchStats]);

  // ---- uploadFile --------------------------------------------------
  // 1. Uploads the raw file binary to Supabase Storage (like S3).
  // 2. Inserts a metadata row into the `files` DB table.
  // 3. Logs the action to `activity_log`.
  // 4. Refreshes all data so the UI updates.
  const uploadFile = useCallback(async (file, collectionId, tag) => {
    setUploading(true);
    setError(null);

    try {
      // Step 1 — upload binary to storage bucket named "vault"
      const storagePath = `uploads/${Date.now()}_${file.name}`;
      const { error: storageError } = await supabase.storage
        .from("vault")
        .upload(storagePath, file);

      if (storageError) throw storageError;

      // Step 2 — insert metadata row
      const { error: dbError } = await supabase.from("files").insert({
        name:          file.name,
        mime_type:     file.type,
        size_bytes:    file.size,
        storage_path:  storagePath,
        collection_id: collectionId ?? null,
        tag:           tag ?? null,
      });

      if (dbError) throw dbError;

      // Step 3 — log the activity
      await supabase.from("activity_log").insert({
        icon:    "+",
        message: `${file.name} uploaded`,
        detail:  collectionId ? `to collection ${collectionId}` : "",
      });

      // Step 4 — refresh everything
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      // finally always runs, even if an error was thrown
      setUploading(false);
    }
  }, [loadAll]);

  // ---- deleteFile --------------------------------------------------
  const deleteFile = useCallback(async (fileId, storagePath) => {
    // Remove from storage
    await supabase.storage.from("vault").remove([storagePath]);
    // Remove DB row
    await supabase.from("files").delete().eq("id", fileId);
    // Refresh
    await loadAll();
  }, [loadAll]);

  // ---- toggleStar --------------------------------------------------
  const toggleStar = useCallback(async (fileId, currentStarred) => {
    await supabase
      .from("files")
      .update({ starred: !currentStarred })
      .eq("id", fileId);
    // Optimistic local update — flip in UI immediately
    setFiles((prev) =>
      prev.map((f) => f.id === fileId ? { ...f, starred: !currentStarred } : f)
    );
  }, []);

  // ---- real-time subscription --------------------------------------
  // Supabase lets you subscribe to DB changes over a WebSocket.
  // Every time someone inserts/updates/deletes a row in `files`,
  // this callback fires and we re-fetch.
  useEffect(() => {
    loadAll(); // initial load

    const channel = supabase
      .channel("vault-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "files" },
        () => { fetchFiles(); fetchStats(); }
      )
      .subscribe();

    // Cleanup: unsubscribe when the component that uses this hook unmounts
    return () => { supabase.removeChannel(channel); };
  }, [loadAll, fetchFiles, fetchStats]);

  // ---- return everything the UI needs ------------------------------
  return {
    files,
    collections,
    activity,
    stats,
    loading,
    uploading,
    error,
    uploadFile,
    deleteFile,
    toggleStar,
  };
}
