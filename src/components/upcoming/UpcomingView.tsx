import React from "react";
import { motion } from "motion/react";
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { TaskCard } from "../common/TaskCard";
import { Task } from "../../types";

export const UpcomingView: React.FC = () => {
  const { tasks, openTaskModal } = useTasks();

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const endOfWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  // Group active pending tasks into timeline buckets
  const pendingTasks = tasks.filter((t) => !t.completed);

  const overdueTasks: Task[] = [];
  const todayTasks: Task[] = [];
  const tomorrowTasks: Task[] = [];
  const thisWeekTasks: Task[] = [];
  const laterTasks: Task[] = [];

  pendingTasks.forEach((task) => {
    const textLower = (task.deadline || "").toLowerCase();

    if (task.deadlineIso) {
      const taskTime = new Date(task.deadlineIso).getTime();
      const taskDateStr = task.deadlineIso.split("T")[0];

      if (!isNaN(taskTime) && taskTime < now.getTime()) {
        overdueTasks.push(task);
      } else if (taskDateStr === todayStr || textLower.includes("today")) {
        todayTasks.push(task);
      } else if (taskDateStr === tomorrowStr || textLower.includes("tomorrow")) {
        tomorrowTasks.push(task);
      } else if (taskTime <= endOfWeek.getTime() || textLower.includes("friday") || textLower.includes("thursday") || textLower.includes("this week")) {
        thisWeekTasks.push(task);
      } else {
        laterTasks.push(task);
      }
    } else {
      // Fallback on human text
      if (textLower.includes("today")) {
        todayTasks.push(task);
      } else if (textLower.includes("tomorrow")) {
        tomorrowTasks.push(task);
      } else if (textLower.includes("friday") || textLower.includes("thursday") || textLower.includes("this week")) {
        thisWeekTasks.push(task);
      } else {
        laterTasks.push(task);
      }
    }
  });

  const sections = [
    {
      title: "Overdue Milestones",
      count: overdueTasks.length,
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/30",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      tasks: overdueTasks,
      emptyText: "Great job! No overdue tasks pending.",
      showIfEmpty: false,
    },
    {
      title: "Due Today",
      count: todayTasks.length,
      icon: Flame,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      tasks: todayTasks,
      emptyText: "No specific tasks scheduled for today.",
      showIfEmpty: true,
    },
    {
      title: "Due Tomorrow",
      count: tomorrowTasks.length,
      icon: Clock,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/30",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
      tasks: tomorrowTasks,
      emptyText: "Nothing scheduled for tomorrow.",
      showIfEmpty: true,
    },
    {
      title: "Upcoming This Week",
      count: thisWeekTasks.length,
      icon: CalendarDays,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
      tasks: thisWeekTasks,
      emptyText: "No remaining deadlines scheduled for this week.",
      showIfEmpty: true,
    },
    {
      title: "Later & In Pipeline",
      count: laterTasks.length,
      icon: CalendarIcon,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      tasks: laterTasks,
      emptyText: "No long-term future tasks found.",
      showIfEmpty: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-cyan-400" />
            <span>Upcoming Timeline</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Chronological roadmap of your upcoming commitments, projects, and deadlines.
          </p>
        </div>

        <button
          onClick={() => openTaskModal(null)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/25 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Task</span>
        </button>
      </div>

      {/* Timeline Sections */}
      <div className="space-y-8">
        {sections.map((section, idx) => {
          if (!section.showIfEmpty && section.tasks.length === 0) return null;
          const Icon = section.icon;

          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${section.bg} ${section.color} ${section.glow}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white font-display">
                    {section.title}
                  </h2>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                  {section.count} {section.count === 1 ? "task" : "tasks"}
                </span>
              </div>

              {section.tasks.length === 0 ? (
                <div className="p-5 rounded-2xl glass-panel text-center text-xs text-slate-500 border border-slate-800/80">
                  {section.emptyText}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
