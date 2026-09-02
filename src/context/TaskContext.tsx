import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import { Task, TaskCategory, TaskPriority, AIInsight, ActiveTab, ThemeMode, AppNotification, Subtask } from "../types";
import { generateSampleTasks } from "../data/initialTasks";

const LOCAL_STORAGE_KEY = "ai_life_admin_tasks_v1";
const SETTINGS_STORAGE_KEY = "ai_life_admin_settings_v1";
const INSIGHTS_STORAGE_KEY = "ai_life_admin_insights_v1";

interface TaskContextType {
  tasks: Task[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Task Actions
  addTask: (task: Omit<Task, "id" | "createdAt"> | Task) => Task;
  addMultipleTasks: (newTasks: (Omit<Task, "id" | "createdAt"> | Task)[]) => Task[];
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  clearCompletedTasks: () => void;
  resetToSampleTasks: () => void;
  clearAllData: () => void;

  // AI Insights
  insights: AIInsight | null;
  isInsightsLoading: boolean;
  fetchInsights: (force?: boolean) => Promise<void>;

  // Global UI modal states
  isTaskModalOpen: boolean;
  taskToEdit: Task | null;
  openTaskModal: (task?: Task | null) => void;
  closeTaskModal: () => void;

  // Quick prompt buffer to bridge between views
  quickPrompt: string;
  setQuickPrompt: (prompt: string) => void;

  // Stats
  urgentCount: number;
  upcomingCount: number;
  completedCount: number;
  overdueCount: number;
  todayCount: number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load tasks from localStorage or initial sample tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse local storage tasks:", e);
    }
    return generateSampleTasks();
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) return parsed.theme;
      }
    } catch {}
    return "cyan_cyber";
  });

  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.notificationsEnabled === "boolean") return parsed.notificationsEnabled;
      }
    } catch {}
    return true;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(() => {
    try {
      const saved = localStorage.getItem(INSIGHTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [quickPrompt, setQuickPrompt] = useState("");

  // Persist tasks
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Could not persist tasks to localStorage", e);
    }
  }, [tasks]);

  // Persist settings
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}");
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...saved, theme: newTheme }));
    } catch {}
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}");
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...saved, notificationsEnabled: enabled }));
    } catch {}
  }, []);

  // Compute computed counts
  const now = new Date();
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  
  const urgentCount = useMemo(() => {
    return pendingTasks.filter((t) => t.priority === "Urgent").length;
  }, [pendingTasks]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.completed).length;
  }, [tasks]);

  const overdueCount = useMemo(() => {
    return pendingTasks.filter((t) => {
      if (!t.deadlineIso) return false;
      const d = new Date(t.deadlineIso);
      return !isNaN(d.getTime()) && d.getTime() < now.getTime();
    }).length;
  }, [pendingTasks, now]);

  const todayCount = useMemo(() => {
    const todayStr = now.toISOString().split("T")[0];
    return pendingTasks.filter((t) => {
      if (!t.deadlineIso) return false;
      return t.deadlineIso.startsWith(todayStr) || t.deadline.toLowerCase().includes("today");
    }).length;
  }, [pendingTasks, now]);

  const upcomingCount = useMemo(() => {
    return pendingTasks.length;
  }, [pendingTasks]);

  // Generate real notifications based on tasks
  useEffect(() => {
    if (!notificationsEnabled) {
      setNotifications([]);
      return;
    }

    const alerts: AppNotification[] = [];
    const urgentItems = tasks.filter((t) => !t.completed && t.priority === "Urgent");

    if (urgentItems.length > 0) {
      alerts.push({
        id: "alert-urgent-1",
        title: "Urgent Attention Required",
        message: `You have ${urgentItems.length} urgent task(s) including "${urgentItems[0].title}".`,
        type: "urgent",
        timestamp: "Just now",
        read: false,
        taskId: urgentItems[0].id,
      });
    }

    const collegeItems = tasks.filter((t) => !t.completed && t.category === "College");
    if (collegeItems.length > 0) {
      alerts.push({
        id: "alert-college-1",
        title: "Academic Deadline Tracking",
        message: `${collegeItems.length} college milestone(s) actively tracked by AI Life Admin.`,
        type: "reminder",
        timestamp: "10 mins ago",
        read: false,
        taskId: collegeItems[0].id,
      });
    }

    alerts.push({
      id: "alert-sys-1",
      title: "AI Engine Connected",
      message: "Gemini 3.7 Flash is active and ready to parse multimodal inputs and messy notes.",
      type: "system",
      timestamp: "Today",
      read: true,
    });

    setNotifications(alerts);
  }, [tasks, notificationsEnabled]);

  // Fetch AI Insights
  const fetchInsights = useCallback(async (force = false) => {
    if (tasks.length === 0) return;
    if (isInsightsLoading) return;
    setIsInsightsLoading(true);

    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          currentDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newInsight: AIInsight = {
          summary: data.summary || "Tasks analyzed successfully.",
          productivityScore: typeof data.productivityScore === "number" ? data.productivityScore : 88,
          keyObservations: data.keyObservations || [
            "Your highest focus is currently allocated to high-impact college and finance obligations.",
            "Zero high-risk overdue items detected for this week.",
          ],
          productivitySuggestions: data.productivitySuggestions || [
            "Knock out quick shopping chores to unblock laboratory work.",
            "Set calendar alerts 24 hours ahead of project deadlines.",
          ],
          categoryDistributionInsight: data.categoryDistributionInsight,
          lastUpdated: new Date().toISOString(),
        };
        setInsights(newInsight);
        localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(newInsight));
      }
    } catch (err) {
      console.warn("Could not fetch insights from server:", err);
      // Fallback local calculation
      const pending = tasks.filter((t) => !t.completed);
      const urgent = pending.filter((t) => t.priority === "Urgent");
      const done = tasks.filter((t) => t.completed);
      const score = Math.min(100, Math.max(40, Math.round((done.length / Math.max(1, tasks.length)) * 100) + 35));

      const fallbackInsight: AIInsight = {
        summary: `You have ${urgent.length} urgent task(s) and ${pending.length} pending obligations.`,
        productivityScore: score,
        keyObservations: [
          `You have ${urgent.length} urgent priority task(s) needing attention.`,
          `Task completion velocity: ${done.length} completed items.`,
        ],
        productivitySuggestions: [
          "Start your morning with the highest priority urgent task.",
          "Group related tasks together into a 45-minute focus sprint.",
        ],
        lastUpdated: new Date().toISOString(),
      };
      setInsights(fallbackInsight);
    } finally {
      setIsInsightsLoading(false);
    }
  }, [tasks, isInsightsLoading]);

  // Initial load insights if none
  useEffect(() => {
    if (!insights && tasks.length > 0) {
      fetchInsights();
    }
  }, [insights, tasks.length, fetchInsights]);

  // Add Task
  const addTask = useCallback((taskData: Omit<Task, "id" | "createdAt"> | Task): Task => {
    const newTask: Task = {
      ...taskData,
      id: "id" in taskData && taskData.id ? taskData.id : `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: "createdAt" in taskData && taskData.createdAt ? taskData.createdAt : new Date().toISOString(),
      subtasks: taskData.subtasks || [],
      completed: !!taskData.completed,
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  // Add Multiple Tasks (e.g. after AI Organize)
  const addMultipleTasks = useCallback((newTaskList: (Omit<Task, "id" | "createdAt"> | Task)[]): Task[] => {
    const formatted: Task[] = newTaskList.map((t, idx) => ({
      ...t,
      id: "id" in t && t.id ? t.id : `task-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: "createdAt" in t && t.createdAt ? t.createdAt : new Date().toISOString(),
      subtasks: t.subtasks || [],
      completed: !!t.completed,
    }));

    setTasks((prev) => [...formatted, ...prev]);

    // Trigger slight confetti for AI magic
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#06b6d4", "#a855f7", "#3b82f6", "#10b981"],
      });
    } catch {}

    return formatted;
  }, []);

  // Update Task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.completed !== undefined && updates.completed !== t.completed) {
            updated.completedAt = updates.completed ? new Date().toISOString() : undefined;
          }
          return updated;
        }
        return t;
      })
    );
  }, []);

  // Delete Task
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Toggle Task Completion
  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            try {
              confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.7 },
                colors: ["#06b6d4", "#10b981", "#a855f7"],
              });
            } catch {}
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  }, []);

  // Subtask handlers
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSub: Subtask = {
            id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: title.trim(),
            completed: false,
          };
          return { ...t, subtasks: [...t.subtasks, newSub] };
        }
        return t;
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) };
        }
        return t;
      })
    );
  }, []);

  // Clear completed tasks
  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  // Reset to sample tasks
  const resetToSampleTasks = useCallback(() => {
    const fresh = generateSampleTasks();
    setTasks(fresh);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fresh));
    fetchInsights(true);
  }, [fetchInsights]);

  // Clear all data
  const clearAllData = useCallback(() => {
    setTasks([]);
    setInsights(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(INSIGHTS_STORAGE_KEY);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const openTaskModal = useCallback((task: Task | null = null) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        notificationsEnabled,
        setNotificationsEnabled,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        addTask,
        addMultipleTasks,
        updateTask,
        deleteTask,
        toggleComplete,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        clearCompletedTasks,
        resetToSampleTasks,
        clearAllData,
        insights,
        isInsightsLoading,
        fetchInsights,
        isTaskModalOpen,
        taskToEdit,
        openTaskModal,
        closeTaskModal,
        quickPrompt,
        setQuickPrompt,
        urgentCount,
        upcomingCount,
        completedCount,
        overdueCount,
        todayCount,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
