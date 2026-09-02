import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Settings,
  Sliders,
  Sparkles,
  Database,
  Moon,
  Bell,
  Shield,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Check,
  Bot,
  Zap,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";

export const SettingsView: React.FC = () => {
  const { tasks, resetToSampleData } = useTasks();

  const [aiModel, setAiModel] = useState("gemini-3.7-flash");
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [smartReminders, setSmartReminders] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [activeTheme, setActiveTheme] = useState<"cyan-purple" | "sapphire" | "emerald">("cyan-purple");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai-life-admin-tasks-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
          <Settings className="w-8 h-8 text-cyan-400" />
          <span>System Settings & Preferences</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize AI assistant intelligence parameters, visual themes, and local storage backup.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
          <Check className="w-4 h-4" />
          <span>Preferences updated and saved to local environment.</span>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. AI Intelligence Engine */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Gemini AI Engine Configuration
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Model Engine
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 font-semibold focus:border-cyan-400 outline-none"
              >
                <option value="gemini-3.7-flash">Gemini 3.7 Flash (Recommended · Ultra Fast)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Utilizes high-speed multimodal multimodal inference for natural language queries and screenshot parsing.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-800 cursor-pointer hover:bg-slate-900">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    Auto-categorize & prioritize incoming text
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Automatically determine if a task belongs to College, Work, Finance, or Health.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoCategorize}
                  onChange={(e) => setAutoCategorize(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-800 cursor-pointer hover:bg-slate-900">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    Smart reminder suggestions
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Proactively calculate optimal lead times (e.g. 1 day before for assignments, 2 days for bills).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smartReminders}
                  onChange={(e) => setSmartReminders(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 2. Visual Theme & Aesthetics */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Moon className="w-5 h-5 text-purple-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              3D Glassmorphism Theme Accents
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setActiveTheme("cyan-purple")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTheme === "cyan-purple"
                  ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 mb-2" />
              <p className="text-xs font-bold text-white">Cyberpunk Horizon</p>
              <p className="text-[10px] text-slate-400">Cyan & Purple Glow (Default)</p>
            </button>

            <button
              onClick={() => setActiveTheme("sapphire")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTheme === "sapphire"
                  ? "bg-blue-500/15 border-blue-500 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 mb-2" />
              <p className="text-xs font-bold text-white">Midnight Sapphire</p>
              <p className="text-[10px] text-slate-400">Deep Blue Neon</p>
            </button>

            <button
              onClick={() => setActiveTheme("emerald")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTheme === "emerald"
                  ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 mb-2" />
              <p className="text-xs font-bold text-white">Matrix Matrix Emerald</p>
              <p className="text-[10px] text-slate-400">High-contrast Green</p>
            </button>
          </div>
        </div>

        {/* 3. Data Storage & Backup */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Data Management & Backup
            </h2>
          </div>

          <p className="text-xs text-slate-400">
            All your tasks are safely persisted to your local browser storage. You can export a JSON backup at any time or reset to realistic demo data.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export JSON Backup ({tasks.length} tasks)</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm("Reset all tasks to sample demonstration data?")) {
                  resetToSampleData();
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-500/15 border border-slate-700 hover:border-amber-500/30 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSavePreferences}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
