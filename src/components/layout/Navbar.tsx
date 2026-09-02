import React, { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Sparkles,
  Menu,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  X,
  Bot,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const {
    openTaskModal,
    setActiveTab,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    urgentCount,
    setQuickPrompt,
  } = useTasks();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQuickPrompt(searchInput.trim());
      setActiveTab("search");
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 sm:h-20 glass-panel border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white font-display">
            AI Life Admin
          </span>
        </div>

        {/* Global Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center relative w-72 lg:w-96"
        >
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ask AI anything (e.g. 'urgent college tasks')..."
            className="w-full pl-9 pr-12 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all"
          />
          <span className="absolute right-2.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ↵ Enter
          </span>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Quick Add Task Button */}
        <button
          onClick={() => openTaskModal(null)}
          className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl glass-panel p-4 border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-white font-display">
                      Life Admin Notifications
                    </h4>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No new notifications. Everything is on schedule.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          n.read
                            ? "bg-slate-900/30 border-slate-800/40 text-slate-400"
                            : "bg-slate-900/90 border-cyan-500/30 text-slate-200 shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === "urgent" ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : n.type === "system" ? (
                            <Bot className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-semibold text-slate-200 truncate">
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-500 shrink-0">
                                {n.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1px] shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center font-bold text-xs text-cyan-300">
                AI
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>

          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">
              Personal Suite
            </p>
            <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-ping" />
              Gemini 3.7 Connected
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
