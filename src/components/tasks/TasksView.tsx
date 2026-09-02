import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Kanban,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Tag,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { TaskCard } from "../common/TaskCard";
import { CategoryBadge } from "../common/CategoryBadge";
import { PriorityBadge } from "../common/PriorityBadge";
import { Task, TaskCategory, TaskPriority, TaskFilterState } from "../../types";

const ALL_CATEGORIES: (TaskCategory | "All")[] = [
  "All",
  "College",
  "Work",
  "Finance",
  "Personal",
  "Shopping",
  "Health",
  "Other",
];

const ALL_PRIORITIES: (TaskPriority | "All")[] = [
  "All",
  "Urgent",
  "High",
  "Medium",
  "Low",
];

export const TasksView: React.FC = () => {
  const { tasks, openTaskModal } = useTasks();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "All">("All");
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Pending" | "Completed" | "Overdue">("All");
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "newest" | "title">("deadline");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("grid");

  // Priority weighting for sorting
  const priorityWeight: Record<TaskPriority, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  // Filter and sort logic
  const filteredTasks = useMemo(() => {
    const now = new Date().getTime();

    return tasks
      .filter((t) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          const matchPriority = t.priority.toLowerCase().includes(q);
          const matchTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCategory && !matchPriority && !matchTags) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== "All" && t.category !== selectedCategory) {
          return false;
        }

        // Priority
        if (selectedPriority !== "All" && t.priority !== selectedPriority) {
          return false;
        }

        // Status
        if (selectedStatus === "Pending" && t.completed) return false;
        if (selectedStatus === "Completed" && !t.completed) return false;
        if (selectedStatus === "Overdue") {
          if (t.completed) return false;
          if (!t.deadlineIso) return false;
          const due = new Date(t.deadlineIso).getTime();
          if (isNaN(due) || due >= now) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        // default deadline sort
        const timeA = a.deadlineIso ? new Date(a.deadlineIso).getTime() : Infinity;
        const timeB = b.deadlineIso ? new Date(b.deadlineIso).getTime() : Infinity;
        return timeA - timeB;
      });
  }, [tasks, searchQuery, selectedCategory, selectedPriority, selectedStatus, sortBy]);

  // Count by categories for pills
  const getCategoryCount = (cat: TaskCategory | "All") => {
    if (cat === "All") return tasks.length;
    return tasks.filter((t) => t.category === cat).length;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-cyan-400" />
            <span>Task Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize, prioritize, and track all your academic, professional, and personal goals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Buttons */}
          <div className="flex items-center p-1 bg-slate-900/80 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all ${
                viewMode === "grid"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="3D Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all ${
                viewMode === "list"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-xl transition-all ${
                viewMode === "kanban"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openTaskModal(null)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by keyword, notes, tags..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(["All", "Pending", "Completed", "Overdue"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === status
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort tasks by"
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-semibold focus:border-cyan-400 outline-none cursor-pointer"
            >
              <option value="deadline">Sort: Deadline Soonest</option>
              <option value="priority">Sort: Urgent Priority First</option>
              <option value="newest">Sort: Recently Added</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800/60 hover:bg-slate-800/60"
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] opacity-70">({getCategoryCount(cat)})</span>
            </button>
          ))}
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Priority:
          </span>
          {ALL_PRIORITIES.map((pri) => (
            <button
              key={pri}
              onClick={() => setSelectedPriority(pri)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedPriority === pri
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800/60 hover:bg-slate-800/60"
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Task Content Views */}
      {filteredTasks.length === 0 ? (
        <div className="py-20 text-center rounded-3xl glass-panel border border-slate-800 space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No tasks match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting search keywords, category, or status filters, or create a new task.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedPriority("All");
              setSelectedStatus("All");
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-cyan-300 hover:bg-slate-700 font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban Board View by Categories */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(["College", "Work", "Finance", "Personal", "Health", "Shopping"] as TaskCategory[]).map((cat) => {
            const catTasks = filteredTasks.filter((t) => t.category === cat);
            if (catTasks.length === 0 && selectedCategory !== "All" && selectedCategory !== cat) {
              return null;
            }

            return (
              <div
                key={cat}
                className="rounded-3xl glass-panel p-4 border border-slate-800/80 space-y-3 flex flex-col"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={cat} size="sm" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                    {catTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 min-h-[160px]">
                  {catTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-600">
                      No tasks in this category
                    </div>
                  ) : (
                    catTasks.map((task) => (
                      <TaskCard key={task.id} task={task} compact />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "list" ? (
        /* Compact List View */
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} compact />
          ))}
        </div>
      ) : (
        /* Default 3D Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
