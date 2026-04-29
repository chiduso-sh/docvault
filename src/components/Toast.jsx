export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg
      animate-[fadeIn_0.2s_ease]
      ${toast.type === "error" ? "bg-red-700" : "bg-brand"}`}
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      {toast.message}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
