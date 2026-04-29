import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

const TABS = ["Overview", "My files", "Shared", "Starred", "Trash"];

export default function Header({ activeTab, onTabChange, search, onSearchChange, onUploadClick }) {
  const { signOut, session } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-brand px-4 sm:px-6 pt-4 sm:pt-5">

      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap mb-4">

        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="1" y="1" width="5" height="5" rx="1"/>
              <rect x="8" y="1" width="5" height="5" rx="1"/>
              <rect x="1" y="8" width="5" height="5" rx="1"/>
              <rect x="8" y="8" width="5" height="5" rx="1"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">DocVault</span>
        </div>

        {/* Search — full width on mobile (order-last), centered on desktop */}
        <div className="order-last sm:order-none flex-1 sm:max-w-sm sm:mx-auto w-full relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm pointer-events-none">⌕</span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search everything..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:bg-white/20 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Upload — hidden label on mobile */}
          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 bg-white text-brand text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span>+</span>
            <span className="hidden sm:inline">New upload</span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold hover:bg-white/30 transition-colors"
              title={session?.user?.email}
            >
              {session?.user?.email?.[0]?.toUpperCase() ?? "U"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[160px] z-50">
                <div className="px-3 py-2 text-xs text-slate-400 truncate border-b border-slate-100">
                  {session?.user?.email}
                </div>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`shrink-0 px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap
              ${activeTab === tab
                ? "text-white border-white font-semibold"
                : "text-white/55 border-transparent hover:text-white/80"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
