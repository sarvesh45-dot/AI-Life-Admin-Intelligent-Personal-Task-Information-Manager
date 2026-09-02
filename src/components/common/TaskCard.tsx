import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles,
  Tag,
  ListTodo,
  Bell,
  Copy,
} from "lucide-react";
import { Task } from "../../types";
import { PriorityBadge } from "./PriorityBadge";
import { CategoryBadge } from "./CategoryBadge";
import { useTasks } from "../../context/TaskContext";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
  const { toggleComplete, deleteTask, toggleSubtask, openTaskModal, updateTask, addTask } =
    useTasks();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOverdue =
    !task.completed &&
    task.deadlineIso &&
    new Date(task.deadlineIso).getTime() < Date.now();

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;

  const handleDuplicate = () => {
    addTask({
      ...task,
      title: `${task.title} (Copy)`,
      completed: false,
      completedAt: undefined,
    });
    setShowMenu(false);
  };

  const getPriorityBorderClass = () => {
    if (task.completed) return "border-slate-800/80 opacity-70";
    switch (task.priority) {
      case "Urgent":
        return "border-rose-500/30 hover:border-rose-400/60 shadow-[0_4px_20px_rgba(244,63,94,0.08)]";
      case "High":
        return "border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_20px_rgba(245,158,11,0.08)]";
      case "Medium":
        return "border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(6,182,212,0.08)]";
      case "Low":
      default:
        return "border-slate-700/50 hover:border-slate-600";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-2xl glass-card p-4 sm:p-5 border transition-all duration-200 ${getPriorityBorderClass()}`}
    >
      {/* Top action row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Custom Animated Checkbox */}
          <button
            onClick={() => toggleComplete(task.id)}
            className={`mt-0.5 relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg border transition-all duration-200 shrink-0 ${
              task.completed
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                : "border-slate-600 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-500/10"
            }`}
            title={task.completed ? "Mark incomplete" : "Mark completed"}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <h3
              onClick={() => openTaskModal(task)}
              className={`text-sm sm:text-base font-semibold leading-snug cursor-pointer transition-colors ${
                task.completed
                  ? "line-through text-slate-500"
                  : "text-slate-100 hover:text-cyan-300"
              }`}
            >
              {task.title}
            </h3>

            {!compact && task.description && (
              <p
                className={`mt-1.5 text-xs sm:text-sm line-clamp-2 leading-relaxed ${
                  task.completed ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Quick Menu Button */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-30 w-44 rounded-xl glass-panel p-1.5 border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    openTaskModal(task);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800/90 rounded-lg transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  Edit Task Details
                </button>
                <button
                  onClick={handleDuplicate}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800/90 rounded-lg transition-colors text-left"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  Duplicate Task
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Task
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Badges & Meta Row */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/60 text-xs">
        <CategoryBadge category={task.category} size="sm" />
        <PriorityBadge priority={task.priority} size="sm" />

        {/* Deadline Indicator */}
        {task.deadline && (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
              isOverdue
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300 font-medium animate-pulse"
                : task.completed
                ? "bg-slate-900/50 border-slate-800 text-slate-500"
                : "bg-slate-900/60 border-slate-800/80 text-cyan-200"
            }`}
          >
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span className="font-mono text-[11px]">{task.deadline}</span>
          </div>
        )}

        {/* Suggested Reminder */}
        {task.suggestedReminder && (
          <div
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]"
            title={`Reminder: ${task.suggestedReminder}`}
          >
            <Bell className="w-3 h-3 text-purple-400" />
            <span className="truncate max-w-[120px]">{task.suggestedReminder}</span>
          </div>
        )}

        {/* AI Organised Pill */}
        {task.source && task.source.startsWith("ai_") && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 ml-auto">
            <Sparkles className="w-2.5 h-2.5" />
            AI Parsed
          </span>
        )}
      </div>

      {/* Subtasks Accordion if any */}
      {totalSubtasksCount > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/50">
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
          >
            <div className="flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Subtasks ({completedSubtasksCount}/{totalSubtasksCount})
              </span>
            </div>
            {showSubtasks ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <AnimatePresence>
            {showSubtasks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 pt-2 pl-2 overflow-hidden"
              >
                {task.subtasks.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer group/sub"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => toggleSubtask(task.id, sub.id)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
                    />
                    <span
                      className={
                        sub.completed
                          ? "line-through text-slate-500"
                          : "text-slate-300"
                      }
                    >
                      {sub.title}
                    </span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
