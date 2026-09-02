export type TaskCategory =
  | "College"
  | "Work"
  | "Finance"
  | "Personal"
  | "Shopping"
  | "Health"
  | "Other";

export type TaskPriority = "Urgent" | "High" | "Medium" | "Low";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline: string;
  deadlineIso?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  suggestedReminder?: string;
  relatedTasks?: string[];
  subtasks: Subtask[];
  source?: "ai_natural_language" | "ai_inbox_screenshot" | "ai_inbox_doc" | "manual";
  tags?: string[];
}

export interface ExtractedTaskPreview {
  title: string;
  description: string;
  deadline: string;
  deadlineIso?: string;
  category: TaskCategory;
  priority: TaskPriority;
  suggestedReminder?: string;
  relatedTasks?: string[];
  confidenceScore?: number;
  reasoning?: string;
  selected?: boolean;
}

export interface AIInsight {
  summary: string;
  productivityScore: number;
  keyObservations: string[];
  productivitySuggestions: string[];
  categoryDistributionInsight?: string;
  lastUpdated: string;
}

export type ActiveTab =
  | "dashboard"
  | "inbox"
  | "tasks"
  | "upcoming"
  | "completed"
  | "search"
  | "settings";

export type ThemeMode = "cyan_cyber" | "violet_nebula" | "emerald_matrix";

export interface TaskFilterState {
  search: string;
  category: TaskCategory | "All";
  priority: TaskPriority | "All";
  status: "All" | "Pending" | "Completed" | "Overdue";
  sortBy: "deadline" | "priority" | "newest" | "title";
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "urgent" | "reminder" | "insight" | "system";
  timestamp: string;
  read: boolean;
  taskId?: string;
}

export interface SearchResultResponse {
  answer: string;
  matchedTaskIds: string[];
  suggestedFollowups?: string[];
}

