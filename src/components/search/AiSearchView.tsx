import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Search,
  Sparkles,
  Bot,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  Clock,
  BookOpen,
  DollarSign,
  Heart,
  Briefcase,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { TaskCard } from "../common/TaskCard";
import { Task, SearchResultResponse } from "../../types";

const SUGGESTED_QUERIES = [
  {
    label: "What is urgent right now?",
    icon: AlertTriangle,
    color: "text-rose-400 border-rose-500/30 hover:bg-rose-500/10",
  },
  {
    label: "What college work do I have pending?",
    icon: BookOpen,
    color: "text-blue-400 border-blue-500/30 hover:bg-blue-500/10",
  },
  {
    label: "What bills or expenses do I need to pay?",
    icon: DollarSign,
    color: "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10",
  },
  {
    label: "What tasks are due this Friday?",
    icon: Clock,
    color: "text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10",
  },
  {
    label: "Show my health & wellness appointments",
    icon: Heart,
    color: "text-purple-400 border-purple-500/30 hover:bg-purple-500/10",
  },
  {
    label: "What work tasks require slide presentations?",
    icon: Briefcase,
    color: "text-amber-400 border-amber-500/30 hover:bg-amber-500/10",
  },
];

export const AiSearchView: React.FC = () => {
  const { tasks, quickPrompt, setQuickPrompt } = useTasks();

  const [query, setQuery] = useState(quickPrompt || "");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResultResponse | null>(null);
  const [matchedTasks, setMatchedTasks] = useState<Task[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (quickPrompt) {
      setQuery(quickPrompt);
      handleExecuteSearch(quickPrompt);
      setQuickPrompt(null);
    }
  }, [quickPrompt]);

  const handleExecuteSearch = async (queryText?: string) => {
    const q = (queryText || query).trim();
    if (!q) return;

    setIsSearching(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/gemini/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          tasks,
        }),
      });

      if (!response.ok) {
        throw new Error("AI Search request failed");
      }

      const data: SearchResultResponse = await response.json();
      setSearchResult(data);

      // Find actual Task objects from matchedTaskIds
      const matched = tasks.filter((t) => data.matchedTaskIds.includes(t.id));
      setMatchedTasks(matched);
    } catch (err: any) {
      console.error("AI Search Error:", err);
      setErrorMsg(err.message || "Failed to search tasks with AI.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-cyan-400" />
          <span>AI Natural Language Search</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Ask conversational questions about your schedule, deadlines, expenses, or academic duties.
        </p>
      </div>

      {/* Main Search Bar Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleFormSubmit} className="relative z-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'What is urgent?', 'What college work do I have?')..."
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-500 text-sm sm:text-base outline-none shadow-inner"
              autoFocus
            />

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                isSearching || !query.trim()
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95"
              }`}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Ask AI</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Quick Suggested Queries */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Suggested queries to try:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((sq, i) => {
                const Icon = sq.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQuery(sq.label);
                      handleExecuteSearch(sq.label);
                    }}
                    className={`px-3 py-1.5 rounded-xl border bg-slate-900/60 text-xs text-slate-300 flex items-center gap-1.5 transition-all group ${sq.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sq.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {isSearching ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            Gemini is evaluating your task index and synthesizing insights...
          </p>
        </div>
      ) : searchResult ? (
        <div className="space-y-6">
          {/* AI Conversational Direct Answer Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl glass-card p-6 sm:p-7 border border-cyan-500/30 shadow-[0_10px_35px_rgba(6,182,212,0.12)] space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  AI Answer
                </h3>
                <p className="text-xs text-slate-400">
                  Synthesized for "{query}"
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
              {searchResult.answer}
            </p>

            {/* Suggested followups */}
            {searchResult.suggestedFollowups && searchResult.suggestedFollowups.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Follow up:
                </span>
                {searchResult.suggestedFollowups.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(f);
                      handleExecuteSearch(f);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-1"
                  >
                    <span>{f}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Matched Task Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                <span>Directly Matched Tasks</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {matchedTasks.length} results
                </span>
              </h3>
            </div>

            {matchedTasks.length === 0 ? (
              <div className="p-6 rounded-2xl glass-panel text-center text-xs text-slate-400 border border-slate-800">
                No individual task cards explicitly matched this query criterion.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl glass-panel border border-slate-800 space-y-3">
          <Search className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Ready for questions</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Type any question above or click one of the suggested prompts to see the GenAI query synthesizer in action.
          </p>
        </div>
      )}
    </div>
  );
};
