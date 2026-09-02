import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Bell,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Task, TaskCategory, TaskPriority, Subtask } from "../../types";
import { useTasks } from "../../context/TaskContext";

const CATEGORIES: TaskCategory[] = [
  "College",
  "Work",
  "Finance",
  "Personal",
  "Shopping",
  "Health",
  "Other",
];

const PRIORITIES: TaskPriority[] = ["Urgent", "High", "Medium", "Low"];

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, closeTaskModal, taskToEdit, addTask, updateTask } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Personal");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [deadline, setDeadline] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [suggestedReminder, setSuggestedReminder] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setDeadline(taskToEdit.deadline || "");
      if (taskToEdit.deadlineIso) {
        setDeadlineDate(taskToEdit.deadlineIso.slice(0, 16));
      } else {
        setDeadlineDate("");
      }
      setSuggestedReminder(taskToEdit.suggestedReminder || "");
      setSubtasks(taskToEdit.subtasks || []);
      setTags(taskToEdit.tags || []);
    } else {
      // Default reset
      setTitle("");
      setDescription("");
      setCategory("College");
      setPriority("Medium");
      setDeadline("This Friday, 5:00 PM");
      setDeadlineDate("");
      setSuggestedReminder("1 day before at 9:00 AM");
      setSubtasks([]);
      setTags([]);
    }
    setError("");
  }, [taskToEdit, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags((prev) => [...prev, tagInput.trim()]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a task title");
      return;
    }

    const calculatedDeadline = deadline.trim() || (deadlineDate ? new Date(deadlineDate).toLocaleString() : "Upcoming");
    const calculatedIso = deadlineDate ? new Date(deadlineDate).toISOString() : taskToEdit?.deadlineIso;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        deadline: calculatedDeadline,
        deadlineIso: calculatedIso,
        suggestedReminder: suggestedReminder.trim() || undefined,
        subtasks,
        tags,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        deadline: calculatedDeadline,
        deadlineIso: calculatedIso,
        completed: false,
        suggestedReminder: suggestedReminder.trim() || undefined,
        subtasks,
        tags,
        source: "manual",
      });
    }

    closeTaskModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTaskModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                  {taskToEdit ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="text-xs text-slate-400">
                  {taskToEdit ? "Update details, priority, and deadlines" : "Add a custom task to your life portfolio"}
                </p>
              </div>
            </div>

            <button
              onClick={closeTaskModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Submit DBMS assignment or Pay electricity bill"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-500 text-sm outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Description & Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add contextual details, requirements, links or remarks..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-500 text-sm outline-none transition-all resize-none"
              />
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        category === cat
                          ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                  {PRIORITIES.map((p) => {
                    const activeColor =
                      p === "Urgent"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : p === "High"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : p === "Medium"
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : "bg-slate-700/30 text-slate-300 border-slate-600";
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          priority === p
                            ? `${activeColor} border shadow-sm`
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Deadline & Reminder Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Deadline (Display Text)
                </label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. This Friday, 5:00 PM or Sep 10"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 text-slate-100 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-purple-400" />
                  Suggested Reminder
                </label>
                <input
                  type="text"
                  value={suggestedReminder}
                  onChange={(e) => setSuggestedReminder(e.target.value)}
                  placeholder="e.g. 1 day before at 9:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-purple-400 text-slate-100 text-sm outline-none"
                />
              </div>
            </div>

            {/* Subtasks Builder */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Checklist / Subtasks
              </label>

              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a step (press Enter)..."
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 text-xs text-slate-100 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  {subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/60 text-xs text-slate-300"
                    >
                      <span className="truncate">{sub.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(sub.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={closeTaskModal}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {taskToEdit ? "Update Task" : "Save Task"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
