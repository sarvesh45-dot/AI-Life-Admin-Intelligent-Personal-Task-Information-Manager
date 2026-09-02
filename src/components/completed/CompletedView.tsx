import React, { useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Trash2,
  RotateCcw,
  Sparkles,
  Trophy,
  Award,
  Calendar,
  Layers,
  Search,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { TaskCard } from "../common/TaskCard";
import { CategoryBadge } from "../common/CategoryBadge";

export const CompletedView: React.FC = () => {
  const { tasks, completedCount, clearCompletedTasks } = useTasks();
  const [searchFilter, setSearchFilter] = useState("");

  const completedTasks = tasks.filter((t) => t.completed);

  const filtered = completedTasks.filter((t) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Achievements Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <span>Completed Archive</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your finished accomplishments and completed milestones.
          </p>
        </div>

        {completedTasks.length > 0 && (
          <button
            onClick={clearCompletedTasks}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed Archive</span>
          </button>
        )}
      </div>

      {/* Hero Stats Card */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 border border-emerald-500/30 shadow-[0_10px_35px_rgba(16,185,129,0.12)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                {completedCount} Tasks Conquered
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Great momentum! Your tasks are successfully executed and archived.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="block text-lg font-bold text-emerald-400 font-mono">
                {Math.round((completedCount / Math.max(1, tasks.length)) * 100)}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Completion Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input for Completed */}
      {completedTasks.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search completed accomplishments..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none"
          />
        </div>
      )}

      {/* Completed List */}
      {completedTasks.length === 0 ? (
        <div className="py-20 text-center rounded-3xl glass-panel border border-slate-800 space-y-3">
          <Award className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No completed tasks yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Check off any active task from your Dashboard or Tasks tab to build your accomplishment streak.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center rounded-3xl glass-panel border border-slate-800 text-xs text-slate-400">
          No completed tasks matched "{searchFilter}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
