import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Send,
  Loader2,
  TrendingUp,
  Brain,
  Lightbulb,
  Clock,
  Layers,
  Zap,
  RefreshCw,
  Plus,
  Flame,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { TaskCard } from "../common/TaskCard";
import { CategoryBadge } from "../common/CategoryBadge";
import { PriorityBadge } from "../common/PriorityBadge";
import { ExtractedTaskPreview, TaskCategory, TaskPriority } from "../../types";

export const DashboardView: React.FC = () => {
  const {
    tasks,
    urgentCount,
    upcomingCount,
    completedCount,
    overdueCount,
    todayCount,
    insights,
    isInsightsLoading,
    fetchInsights,
    addMultipleTasks,
    setActiveTab,
    openTaskModal,
  } = useTasks();

  const [aiInputText, setAiInputText] = useState("");
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizeError, setOrganizeError] = useState("");
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTaskPreview[]>([]);
  const [showExtractedModal, setShowExtractedModal] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning 👋";
    if (hour < 17) return "Good afternoon 👋";
    return "Good evening 👋";
  };

  // Preset sample prompts
  const samplePrompts = [
    "I need to submit my DBMS project on Friday, pay electricity bill before 10 September and buy a notebook.",
    "Dentist appointment on Tuesday 10am, buy organic groceries tonight, call mom this Sunday.",
    "Prepare slides for sprint demo on Thursday, review quarterly budget by next Monday, schedule gym session.",
  ];

  // Completion percentage
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Urgent & Due Soon tasks spotlight
  const urgentTasks = tasks.filter((t) => !t.completed && (t.priority === "Urgent" || t.priority === "High")).slice(0, 4);

  const handleOrganizeWithAI = async (textToProcess?: string) => {
    const targetText = textToProcess || aiInputText;
    if (!targetText.trim()) return;

    setIsOrganizing(true);
    setOrganizeError("");

    try {
      const response = await fetch("/api/gemini/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: targetText.trim(),
          currentDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process tasks with AI");
      }

      const data = await response.json();
      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        const formatted: ExtractedTaskPreview[] = data.tasks.map((t: any) => ({
          title: t.title || "Untitled Task",
          description: t.description || "",
          deadline: t.deadline || "Upcoming",
          deadlineIso: t.deadlineIso,
          category: (t.category as TaskCategory) || "Personal",
          priority: (t.priority as TaskPriority) || "Medium",
          suggestedReminder: t.suggestedReminder || "1 day before",
          relatedTasks: t.relatedTasks || [],
          confidenceScore: t.confidenceScore || 0.95,
          reasoning: t.reasoning || "Extracted by Gemini AI",
          selected: true,
        }));
        setExtractedTasks(formatted);
        setShowExtractedModal(true);
        setAiInputText("");
      } else {
        setOrganizeError("AI could not detect distinct tasks. Try providing more details.");
      }
    } catch (err: any) {
      console.error("Organize error:", err);
      setOrganizeError(err.message || "An error occurred while calling the AI engine.");
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleConfirmAddExtracted = () => {
    const selected = extractedTasks.filter((t) => t.selected);
    if (selected.length === 0) return;

    const formattedForContext = selected.map((t) => ({
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      deadline: t.deadline,
      deadlineIso: t.deadlineIso,
      completed: false,
      suggestedReminder: t.suggestedReminder,
      relatedTasks: t.relatedTasks,
      subtasks: (t.relatedTasks || []).map((subTitle, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: subTitle,
        completed: false,
      })),
      source: "ai_natural_language" as const,
      tags: [t.category, "AI Organized"],
    }));

    addMultipleTasks(formattedForContext);
    setShowExtractedModal(false);
    setExtractedTasks([]);
  };

  const toggleExtractedSelection = (index: number) => {
    setExtractedTasks((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, selected: !t.selected } : t))
    );
  };

  const updateExtractedField = (index: number, field: keyof ExtractedTaskPreview, val: any) => {
    setExtractedTasks((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, [field]: val } : t))
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight flex items-center gap-3"
          >
            <span>{getGreeting()}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-slate-400 mt-1"
          >
            Here's what needs your attention today.
          </motion.p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchInsights(true)}
            disabled={isInsightsLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isInsightsLoading ? "animate-spin" : ""}`} />
            <span>{isInsightsLoading ? "Analyzing..." : "Sync AI Insights"}</span>
          </button>
        </div>
      </div>

      {/* 2. 3D Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {/* Urgent Tasks Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => setActiveTab("tasks")}
          className="relative rounded-3xl glass-card p-5 sm:p-6 border border-rose-500/30 overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(244,63,94,0.12)] group"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-rose-300 tracking-wide uppercase">
              Urgent Tasks
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {urgentCount}
            </span>
            <span className="text-xs text-rose-300/80 font-medium">
              {overdueCount > 0 ? `(${overdueCount} overdue)` : "need immediate action"}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Review urgent items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Upcoming Tasks Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => setActiveTab("upcoming")}
          className="relative rounded-3xl glass-card p-5 sm:p-6 border border-cyan-500/30 overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(6,182,212,0.12)] group"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-cyan-300 tracking-wide uppercase">
              Upcoming Tasks
            </span>
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {upcomingCount}
            </span>
            <span className="text-xs text-cyan-300/80 font-medium">
              {todayCount > 0 ? `${todayCount} scheduled for today` : "active in pipeline"}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Open schedule timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Completed Tasks Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => setActiveTab("completed")}
          className="relative rounded-3xl glass-card p-5 sm:p-6 border border-emerald-500/30 overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(16,185,129,0.12)] group"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-emerald-300 tracking-wide uppercase">
              Completed Tasks
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                {completedCount}
              </span>
              <p className="text-xs text-emerald-300/80 font-medium">
                {completionPercentage}% total velocity
              </p>
            </div>

            {/* Circular Progress Indicator */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-500"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-emerald-300">
                {completionPercentage}%
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
            <span>View achievements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      </div>

      {/* 3. Hero Large AI Input Card */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                What's on your mind?
              </h2>
              <p className="text-xs text-slate-400">
                Type messy notes, deadlines, chores, or reminders — AI will parse, categorize, and schedule them.
              </p>
            </div>
          </div>

          {/* Text Area */}
          <div className="mt-4 relative">
            <textarea
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleOrganizeWithAI();
                }
              }}
              rows={3}
              placeholder="e.g. I need to submit my DBMS project on Friday, pay electricity bill before 10 September and buy a notebook."
              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-500 text-sm sm:text-base leading-relaxed outline-none transition-all resize-none shadow-inner"
            />

            {/* Glowing Action Button */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Powered by Gemini 3.7 Flash</span>
                <span className="hidden sm:inline text-slate-600">·</span>
                <span className="hidden sm:inline text-slate-500">Cmd + Enter to trigger</span>
              </div>

              <button
                onClick={() => handleOrganizeWithAI()}
                disabled={isOrganizing || !aiInputText.trim()}
                className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 ${
                  isOrganizing || !aiInputText.trim()
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] active:scale-95"
                }`}
              >
                {isOrganizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                    <span>✨ Organize with AI</span>
                  </>
                )}
              </button>
            </div>

            {organizeError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {organizeError}
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Try a sample prompt:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiInputText(prompt);
                    handleOrganizeWithAI(prompt);
                  }}
                  className="text-left px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 group"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400/70 group-hover:text-cyan-300" />
                  <span className="truncate max-w-[280px] sm:max-w-md">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI Insights & Diagnostics Section */}
      {insights && (
        <div className="rounded-3xl glass-card p-6 border border-purple-500/25 shadow-[0_10px_35px_rgba(168,85,247,0.1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  AI Life Insights
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time cognitive workload and productivity diagnostics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Productivity Score:{" "}
                <span className="text-emerald-400 font-mono font-bold">
                  {insights.productivityScore}/100
                </span>
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Observations */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Workload Observations
              </h4>
              <p className="text-sm font-medium text-slate-200 leading-relaxed bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800">
                "{insights.summary}"
              </p>
              <ul className="space-y-2">
                {insights.keyObservations.map((obs, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Suggestions */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Actionable Next Steps
              </h4>
              <div className="space-y-2.5">
                {insights.productivitySuggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 text-xs text-slate-300 flex items-start gap-2.5 transition-colors"
                  >
                    <span className="font-mono text-amber-400 font-bold">0{i + 1}</span>
                    <span className="leading-relaxed">{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Spotlight: Urgent & Due Soon */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">
              Attention Spotlight
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              {urgentTasks.length} high priority
            </span>
          </div>

          <button
            onClick={() => setActiveTab("tasks")}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View all tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentTasks.length === 0 ? (
          <div className="p-8 rounded-3xl glass-panel text-center border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">All clear!</h3>
            <p className="text-xs text-slate-400 mt-1">
              No urgent tasks currently pending. You are ahead of schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Modal: AI Extracted Tasks Review */}
      <AnimatePresence>
        {showExtractedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExtractedModal(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.2)] z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                      Extracted Tasks ({extractedTasks.filter((t) => t.selected).length}/{extractedTasks.length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Gemini structured your input. Review or edit details before adding to your portfolio.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowExtractedModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors"
                >
                  Dismiss
                </button>
              </div>

              {/* Cards List */}
              <div className="mt-6 space-y-4">
                {extractedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      t.selected
                        ? "bg-slate-900/90 border-cyan-500/40 shadow-lg"
                        : "bg-slate-950/40 border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={t.selected}
                        onChange={() => toggleExtractedSelection(idx)}
                        className="w-5 h-5 rounded-md border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 cursor-pointer shrink-0 mt-1"
                      />

                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={t.title}
                          onChange={(e) => updateExtractedField(idx, "title", e.target.value)}
                          className="w-full font-bold text-sm sm:text-base text-white bg-transparent border-b border-slate-800 focus:border-cyan-400 pb-1 outline-none"
                        />

                        <textarea
                          value={t.description}
                          onChange={(e) => updateExtractedField(idx, "description", e.target.value)}
                          rows={2}
                          className="w-full text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none resize-none"
                        />

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <CategoryBadge category={t.category} size="sm" />
                          <PriorityBadge priority={t.priority} size="sm" />
                          <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 text-[11px] font-mono">
                            Deadline: {t.deadline}
                          </div>
                          {t.suggestedReminder && (
                            <div className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]">
                              Reminder: {t.suggestedReminder}
                            </div>
                          )}
                        </div>

                        {/* Related preparatory subtasks */}
                        {t.relatedTasks && t.relatedTasks.length > 0 && (
                          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                            <span className="font-semibold text-slate-300">Suggested subtasks: </span>
                            {t.relatedTasks.join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowExtractedModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAddExtracted}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>
                    Add {extractedTasks.filter((t) => t.selected).length} Task(s) to Portfolio
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
