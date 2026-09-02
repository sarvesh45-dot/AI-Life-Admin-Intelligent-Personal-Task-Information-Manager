import React from "react";
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  CalendarDays,
  CheckCircle2,
  Search,
  Settings,
  Sparkles,
  X,
  Zap,
  Flame,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { ActiveTab } from "../../types";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
}) => {
  const {
    activeTab,
    setActiveTab,
    urgentCount,
    upcomingCount,
    completedCount,
  } = useTasks();

  const navigationItems = [
    {
      id: "dashboard" as ActiveTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: urgentCount > 0 ? `${urgentCount} urgent` : undefined,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    {
      id: "inbox" as ActiveTab,
      label: "AI Inbox",
      icon: Inbox,
      badge: "Multimodal",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "tasks" as ActiveTab,
      label: "Tasks",
      icon: CheckSquare,
      badge: `${upcomingCount}`,
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      id: "upcoming" as ActiveTab,
      label: "Upcoming",
      icon: CalendarDays,
    },
    {
      id: "completed" as ActiveTab,
      label: "Completed",
      icon: CheckCircle2,
      badge: completedCount > 0 ? `${completedCount}` : undefined,
      badgeColor: "bg-slate-800 text-slate-400 border-slate-700",
    },
    {
      id: "search" as ActiveTab,
      label: "AI Search",
      icon: Search,
      badge: "Natural Lang",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      id: "settings" as ActiveTab,
      label: "Settings",
      icon: Settings,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-64 xl:w-72 glass-panel border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Logo and Header */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-all">
                  <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
                </div>
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-30 blur-sm -z-10 group-hover:opacity-70 transition-all" />
              </div>

              <div>
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white font-display flex items-center gap-1.5">
                  AI Life Admin
                </h1>
                <span className="text-[10px] font-mono font-semibold tracking-wider text-cyan-400 uppercase">
                  GenAI Personal OS
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* App Tagline Badge */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] leading-snug text-slate-400">
            <span className="text-cyan-300 font-medium">
              "Don't manage your information.
            </span>{" "}
            Let AI manage the work."
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 sm:px-4 py-2 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                      item.badgeColor || "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom AI Status & Productivity Card */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              AI Intelligence
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Gemini multimodal extraction & search engine ready.
          </p>

          <button
            onClick={() => handleNavClick("search")}
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Query AI Assistant
          </button>
        </div>
      </aside>
    </>
  );
};
