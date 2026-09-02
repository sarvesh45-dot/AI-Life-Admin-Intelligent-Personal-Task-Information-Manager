import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Inbox,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  FileCode,
  ScanLine,
  Eye,
  RefreshCw,
  FileQuestion,
  FileCheck,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { CategoryBadge } from "../common/CategoryBadge";
import { PriorityBadge } from "../common/PriorityBadge";
import { ExtractedTaskPreview, TaskCategory, TaskPriority } from "../../types";

// Interactive sample demo assets for instant 1-click testing
const INBOX_PRESETS = [
  {
    id: "preset-college-notice",
    title: "College Assignment Notice (Screenshot)",
    type: "image",
    description: "Notice screenshot: 'CS502: Submit DBMS Laboratory Mini-Project Report & ER diagrams by Friday 5 PM. Max marks: 25.'",
    previewText: "DEPARTMENT OF COMPUTER SCIENCE\nCourse: Database Management Systems (CS502)\nAnnouncement: All teams must submit their Project Report, Schema SQL Scripts, and 3NF Normalization tables on Friday before 5:00 PM.",
    simulatedTasks: [
      {
        title: "Submit DBMS Laboratory Mini-Project Report & SQL Scripts",
        description: "Submit final project report with schema diagrams and 3NF tables for CS502 before 5:00 PM cutoff.",
        category: "College" as TaskCategory,
        priority: "Urgent" as TaskPriority,
        deadline: "This Friday, 5:00 PM",
        deadlineIso: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        suggestedReminder: "1 day before at 9:00 AM",
        relatedTasks: ["Verify foreign key constraints", "Format PDF documentation"],
        confidenceScore: 0.98,
        reasoning: "Detected academic deadline notice with explicit Friday cutoff.",
      },
    ],
  },
  {
    id: "preset-electric-bill",
    title: "Electricity Utility Bill (PDF / Scan)",
    type: "document",
    description: "Utility bill snippet: 'Account #44091 - Monthly Power Bill: $94.20 due by Sep 10, 2026. Pay early to avoid late fee.'",
    previewText: "ENERGY GRID CORPORATION\nInvoice #: INV-2026-904\nAccount: #44091-09\nAmount Due: $94.20\nDue Date: September 10, 2026\nNotice: Auto-debit scheduled or pay online via portal.",
    simulatedTasks: [
      {
        title: "Pay Monthly Electricity Power Bill (Acc #44091)",
        description: "Pay $94.20 electric utility invoice before Sep 10 deadline to prevent late fee penalty.",
        category: "Finance" as TaskCategory,
        priority: "High" as TaskPriority,
        deadline: "Sep 10, 2026, 11:59 PM",
        deadlineIso: new Date("2026-09-10T23:59:00.000Z").toISOString(),
        suggestedReminder: "Sep 8 at 10:00 AM",
        relatedTasks: ["Download payment confirmation", "Log in monthly budget tracker"],
        confidenceScore: 0.96,
        reasoning: "Recognized utility bill invoice with explicit due date.",
      },
    ],
  },
  {
    id: "preset-slack-memo",
    title: "Slack / WhatsApp Team Message",
    type: "image",
    description: "Chat message: 'Hey team, please update your sprint progress slide deck before Thursday 3 PM meeting.'",
    previewText: "@channel Reminder: Please finalize your microservice benchmarking slides and update sprint board by Thursday 3:00 PM sharp for client sync.",
    simulatedTasks: [
      {
        title: "Finalize Sprint Progress Slide Deck & Update Board",
        description: "Update sprint deliverables and prepare microservice latency slides for Thursday client demo sync.",
        category: "Work" as TaskCategory,
        priority: "High" as TaskPriority,
        deadline: "Thursday, 3:00 PM",
        deadlineIso: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
        suggestedReminder: "Thursday morning at 9:00 AM",
        relatedTasks: ["Gather telemetry graphs", "Run 5-minute slide rehearsal"],
        confidenceScore: 0.94,
        reasoning: "Extracted work team reminder with Thursday 3:00 PM deadline.",
      },
    ],
  },
  {
    id: "preset-doctor-note",
    title: "Clinic Prescription & Follow-up Note",
    type: "document",
    description: "Doctor note: 'Follow-up dental cleaning next Tuesday 10:30 AM with Dr. Thorne at Apex Health.'",
    previewText: "APEX WELLNESS & DENTAL CLINIC\nPatient Consultation Card\nDr. Aris Thorne\nFollow-up: Routine prophylaxis & dental scaling scheduled for Next Tuesday at 10:30 AM.",
    simulatedTasks: [
      {
        title: "Attend Routine Dental Cleaning Appointment with Dr. Thorne",
        description: "Scheduled dental checkup and prophylaxis at Apex Wellness clinic.",
        category: "Health" as TaskCategory,
        priority: "Medium" as TaskPriority,
        deadline: "Next Tuesday, 10:30 AM",
        deadlineIso: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        suggestedReminder: "1 day before at 6:00 PM",
        relatedTasks: ["Carry clinic registration card"],
        confidenceScore: 0.95,
        reasoning: "Detected medical appointment scheduled for next Tuesday.",
      },
    ],
  },
];

export const AiInboxView: React.FC = () => {
  const { addMultipleTasks, setActiveTab } = useTasks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    base64?: string;
    previewUrl?: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSummary, setProcessingSummary] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTaskPreview[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTabSub, setActiveTabSub] = useState<"upload" | "presets">("upload");

  // File Upload Handlers
  const handleFileSelect = (file: File) => {
    setErrorMsg("");
    const reader = new FileReader();

    if (file.type.startsWith("image/")) {
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedFile({
          name: file.name,
          type: file.type,
          base64: base64,
          previewUrl: base64,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Text or Document
      reader.onload = () => {
        const textContent = reader.result as string;
        setSelectedFile({
          name: file.name,
          type: file.type || "text/plain",
          base64: undefined,
          previewUrl: undefined,
        });
        if (typeof textContent === "string") {
          setInputText(textContent.slice(0, 4000));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!inputText.trim() && !selectedFile) {
      setErrorMsg("Please upload a file/screenshot or enter text notes to analyze.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");
    setProcessingSummary(null);

    try {
      const response = await fetch("/api/gemini/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText.trim(),
          imageBase64: selectedFile?.base64,
          mimeType: selectedFile?.type,
          fileName: selectedFile?.name,
          currentDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process document with Gemini AI");
      }

      const data = await response.json();
      setProcessingSummary(data.summary || "Content analyzed successfully.");
      setDetectedType(data.detectedDocumentType || "Document");

      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        const formatted: ExtractedTaskPreview[] = data.tasks.map((t: any) => ({
          title: t.title || "Extracted Action Item",
          description: t.description || "",
          category: (t.category as TaskCategory) || "Personal",
          priority: (t.priority as TaskPriority) || "Medium",
          deadline: t.deadline || "Upcoming",
          deadlineIso: t.deadlineIso,
          suggestedReminder: t.suggestedReminder || "1 day before",
          relatedTasks: t.relatedTasks || [],
          confidenceScore: t.confidenceScore || 0.95,
          reasoning: t.reasoning || "Multimodal vision parsing",
          selected: true,
        }));
        setExtractedTasks(formatted);
      } else {
        setErrorMsg("No clear actionable tasks were recognized in this content.");
      }
    } catch (err: any) {
      console.error("Inbox AI error:", err);
      setErrorMsg(err.message || "Failed to analyze document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadPreset = (preset: typeof INBOX_PRESETS[0]) => {
    setInputText(preset.previewText);
    setSelectedFile({
      name: `${preset.title}.png`,
      type: preset.type === "image" ? "image/png" : "application/pdf",
      previewUrl: undefined,
    });
    setProcessingSummary(`Loaded demo asset: ${preset.title}. Multimodal analysis ready.`);
    setDetectedType(preset.title);
    setExtractedTasks(
      preset.simulatedTasks.map((t) => ({
        ...t,
        selected: true,
      }))
    );
  };

  const handleImportToTasks = () => {
    const selected = extractedTasks.filter((t) => t.selected);
    if (selected.length === 0) return;

    const formatted = selected.map((t) => ({
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      deadline: t.deadline,
      deadlineIso: t.deadlineIso,
      completed: false,
      suggestedReminder: t.suggestedReminder,
      relatedTasks: t.relatedTasks,
      subtasks: (t.relatedTasks || []).map((st, i) => ({
        id: `sub-inbox-${Date.now()}-${i}`,
        title: st,
        completed: false,
      })),
      source: selectedFile?.base64 ? ("ai_inbox_screenshot" as const) : ("ai_inbox_doc" as const),
      tags: ["Inbox", t.category],
    }));

    addMultipleTasks(formatted);
    // Reset state
    setSelectedFile(null);
    setInputText("");
    setExtractedTasks([]);
    setProcessingSummary(null);
    setActiveTab("tasks");
  };

  const toggleExtracted = (index: number) => {
    setExtractedTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  };

  const updateTaskField = (index: number, field: keyof ExtractedTaskPreview, val: any) => {
    setExtractedTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: val } : t))
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <Inbox className="w-8 h-8 text-cyan-400" />
            <span>AI Multimodal Inbox</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload screenshots, homework notices, invoices, or tickets. Gemini extracts deadlines & schedules tasks.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-900/80 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTabSub("upload")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTabSub === "upload"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Upload / Input
          </button>
          <button
            onClick={() => setActiveTabSub("presets")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTabSub === "presets"
                ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Instant Demo Presets
          </button>
        </div>
      </div>

      {activeTabSub === "presets" ? (
        /* Demo Presets Tab */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Click any realistic preset below to test multimodal task extraction with instant zero-friction demo data.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INBOX_PRESETS.map((preset) => (
              <motion.div
                key={preset.id}
                whileHover={{ y: -3 }}
                onClick={() => {
                  loadPreset(preset);
                  setActiveTabSub("upload");
                }}
                className="p-5 rounded-3xl glass-card border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {preset.type === "image" ? "🖼️ Screenshot Demo" : "📄 Document Demo"}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    Load & Analyze
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  {preset.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {preset.description}
                </p>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-line">
                  {preset.previewText}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Upload / Input Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Upload Area */}
          <div className="lg:col-span-6 space-y-4">
            {/* Drag & Drop Card */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="group relative rounded-3xl glass-card p-6 sm:p-8 border-2 border-dashed border-slate-700/80 hover:border-cyan-400/80 bg-slate-950/40 hover:bg-cyan-950/10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[220px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {selectedFile?.previewUrl ? (
                <div className="space-y-3 w-full">
                  <div className="relative max-h-48 mx-auto rounded-xl overflow-hidden border border-cyan-500/30 shadow-lg">
                    <img
                      src={selectedFile.previewUrl}
                      alt="Uploaded Screenshot"
                      className="w-full object-contain max-h-44 bg-slate-950"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-cyan-300 font-semibold">
                    <FileCheck className="w-4 h-4" />
                    <span>{selectedFile.name} (Ready for Vision AI)</span>
                  </div>
                </div>
              ) : selectedFile ? (
                <div className="space-y-2">
                  <FileText className="w-10 h-10 text-cyan-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">Document ready to parse</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Drop screenshot or document here
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports PNG, JPG, WebP, PDF or plain text notes
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-lg bg-slate-800/80 text-[11px] font-semibold text-slate-300">
                    Browse Files
                  </span>
                </div>
              )}
            </div>

            {/* Accompanying or Raw Text Notes */}
            <div className="rounded-3xl glass-panel p-5 border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Raw Text or Context Note
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                placeholder="Paste email text, syllabus paragraph, or add remarks to accompany the screenshot..."
                className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none transition-all"
              />

              <div className="flex items-center justify-between pt-1">
                {selectedFile && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setInputText("");
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear upload
                  </button>
                )}

                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={isProcessing || (!inputText.trim() && !selectedFile)}
                  className={`ml-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    isProcessing || (!inputText.trim() && !selectedFile)
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Vision Agent Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                      <span>Scan & Extract with AI</span>
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          {/* Right Results & Extracted Tasks Review Area */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl glass-panel p-6 border border-slate-800 min-h-[440px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ScanLine className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white font-display">
                      Extracted Action Items
                    </h3>
                  </div>
                  {extractedTasks.length > 0 && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      {extractedTasks.filter((t) => t.selected).length} selected
                    </span>
                  )}
                </div>

                {/* Status / Summary Banner */}
                {processingSummary && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">
                        {detectedType || "Document Recognized"}
                      </p>
                      <p className="mt-0.5 leading-relaxed text-cyan-300/80">
                        {processingSummary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Extracted Tasks Review List */}
                {extractedTasks.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 space-y-2">
                    <Inbox className="w-12 h-12 mx-auto text-slate-700 opacity-60" />
                    <p className="text-sm font-semibold text-slate-400">
                      AI Inbox is waiting for content
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Upload an image, drop a screenshot, or select a demo preset on the left to extract structured tasks.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {extractedTasks.map((task, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          task.selected
                            ? "bg-slate-900/90 border-cyan-500/40 shadow-md"
                            : "bg-slate-950/40 border-slate-800 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.selected}
                            onChange={() => toggleExtracted(idx)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 cursor-pointer shrink-0 mt-1"
                          />

                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => updateTaskField(idx, "title", e.target.value)}
                              className="w-full text-xs sm:text-sm font-bold text-white bg-transparent border-b border-slate-800 focus:border-cyan-400 pb-0.5 outline-none"
                            />

                            <textarea
                              value={task.description}
                              onChange={(e) => updateTaskField(idx, "description", e.target.value)}
                              rows={2}
                              className="w-full text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800 focus:border-cyan-400 outline-none resize-none"
                            />

                            <div className="flex flex-wrap items-center gap-2">
                              <CategoryBadge category={task.category} size="sm" />
                              <PriorityBadge priority={task.priority} size="sm" />
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                                {task.deadline}
                              </span>
                            </div>

                            {task.reasoning && (
                              <p className="text-[11px] text-slate-400 italic">
                                💡 {task.reasoning}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Import Button */}
              {extractedTasks.length > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Review and confirm action items
                  </span>
                  <button
                    onClick={handleImportToTasks}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Import to My Tasks</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
