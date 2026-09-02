import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initializer for Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health endpoint
app.get("/api/health", (_req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    aiEnabled: hasKey,
    serverTime: new Date().toISOString(),
  });
});

// Fallback intelligent parser for offline/no-key mode to guarantee seamless demo
function fallbackOrganize(text: string, referenceDate: string) {
  const now = new Date(referenceDate || Date.now());
  const lines = text
    .split(/,|\n|\band\b|\balso\b/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  const tasks = lines.map((segment, idx) => {
    const lower = segment.toLowerCase();
    let category = "Personal";
    let priority = "Medium";
    let deadline = "In 3 days";
    const targetDate = new Date(now.getTime() + (idx + 2) * 24 * 60 * 60 * 1000);

    if (lower.includes("project") || lower.includes("dbms") || lower.includes("assignment") || lower.includes("exam") || lower.includes("college") || lower.includes("study") || lower.includes("class")) {
      category = "College";
      priority = "Urgent";
    } else if (lower.includes("bill") || lower.includes("pay") || lower.includes("electricity") || lower.includes("rent") || lower.includes("bank") || lower.includes("tax")) {
      category = "Finance";
      priority = "High";
    } else if (lower.includes("buy") || lower.includes("notebook") || lower.includes("shop") || lower.includes("order") || lower.includes("groceries")) {
      category = "Shopping";
      priority = "Low";
    } else if (lower.includes("doctor") || lower.includes("medicine") || lower.includes("gym") || lower.includes("health") || lower.includes("water")) {
      category = "Health";
      priority = "High";
    } else if (lower.includes("meeting") || lower.includes("client") || lower.includes("work") || lower.includes("report") || lower.includes("presentation")) {
      category = "Work";
      priority = "High";
    }

    if (lower.includes("friday")) {
      deadline = "This Friday, 5:00 PM";
    } else if (lower.includes("10 september") || lower.includes("sep 10")) {
      deadline = "Sep 10, 11:59 PM";
    } else if (lower.includes("tomorrow")) {
      deadline = "Tomorrow, 9:00 AM";
    } else if (lower.includes("urgent") || lower.includes("today") || lower.includes("asap")) {
      deadline = "Today, 6:00 PM";
      priority = "Urgent";
    }

    return {
      title: segment.charAt(0).toUpperCase() + segment.slice(1),
      description: `Action item extracted from your note: "${segment}".`,
      deadline,
      deadlineIso: targetDate.toISOString(),
      category,
      priority,
      suggestedReminder: "1 day before at 9:00 AM",
      relatedTasks: [`Review requirements for ${segment.slice(0, 20)}`, "Verify completion criteria"],
      confidenceScore: 0.95,
      reasoning: `Auto-categorized as ${category} based on keywords in prompt.`,
    };
  });

  return tasks.length > 0
    ? tasks
    : [
        {
          title: text.slice(0, 40),
          description: text,
          deadline: "Upcoming",
          deadlineIso: new Date(now.getTime() + 48 * 3600 * 1000).toISOString(),
          category: "Personal",
          priority: "Medium",
          suggestedReminder: "Tomorrow morning",
          relatedTasks: ["Review task details"],
          confidenceScore: 0.9,
          reasoning: "Extracted as general personal task.",
        },
      ];
}

// 1. Organize messy natural language with Gemini
app.post("/api/gemini/organize", async (req, res) => {
  try {
    const { text, userContext, currentDate } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text prompt is required" });
      return;
    }

    const refDate = currentDate || new Date().toISOString();
    const ai = getGenAI();

    if (!ai) {
      const fallback = fallbackOrganize(text, refDate);
      res.json({ tasks: fallback, source: "local_fallback" });
      return;
    }

    const systemInstruction = `You are AI Life Admin, an elite executive assistant and task intelligence engine.
Reference Current Date & Time: ${refDate}.
The user will provide messy, stream-of-consciousness natural language text containing one or more action items, reminders, chores, college projects, financial bills, or appointments.

Your goal is to parse every single implied or explicit task accurately into structured data:
- Extract clear, concise, actionable titles (e.g., "Submit DBMS Project", "Pay Electricity Bill", "Buy Notebook").
- Detailed description with context.
- Deadlines: Compute relative dates based on ${refDate} (e.g., if user says "Friday", "10 September", "tomorrow", resolve the human label and the exact ISO 8601 string).
- Categorize into strictly one of: College, Work, Finance, Personal, Shopping, Health, Other.
- Prioritize into strictly one of: Urgent, High, Medium, Low.
- Provide a helpful suggested reminder time (e.g., "1 day before at 9:00 AM", "Morning of deadline at 8:00 AM").
- Suggest 1-3 logical related preparatory subtasks or steps.
- Provide a brief 1-sentence reasoning and confidence score (0.0 to 1.0).

Return ONLY valid JSON matching the schema.`;

    const prompt = `Extract all tasks from this message:\n\n"${text}"\n\nUser Context: ${userContext || "General personal productivity"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  deadline: { type: Type.STRING, description: "Human readable deadline like 'This Friday, 5:00 PM' or 'Sep 10, 2026'" },
                  deadlineIso: { type: Type.STRING, description: "ISO 8601 datetime string" },
                  category: {
                    type: Type.STRING,
                    enum: ["College", "Work", "Finance", "Personal", "Shopping", "Health", "Other"],
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ["Urgent", "High", "Medium", "Low"],
                  },
                  suggestedReminder: { type: Type.STRING },
                  relatedTasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  confidenceScore: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING },
                },
                required: ["title", "category", "priority", "deadline"],
              },
            },
          },
          required: ["tasks"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ tasks: parsed.tasks || [], source: "gemini" });
  } catch (error: any) {
    console.error("Gemini organize error:", error);
    const fallback = fallbackOrganize(req.body.text || "", req.body.currentDate || new Date().toISOString());
    res.json({ tasks: fallback, source: "fallback_on_error", error: error.message });
  }
});

// 2. Multimodal AI Inbox (Screenshots, Image, Document text)
app.post("/api/gemini/inbox", async (req, res) => {
  try {
    const { text, imageBase64, mimeType, fileName, currentDate } = req.body;
    const refDate = currentDate || new Date().toISOString();
    const ai = getGenAI();

    if (!ai) {
      const fallbackTasks = fallbackOrganize(text || fileName || "Uploaded Document Task", refDate);
      res.json({
        summary: `Analyzed document (${fileName || "image"}). Found ${fallbackTasks.length} action item(s).`,
        detectedDocumentType: "Visual Notice / Screenshot",
        tasks: fallbackTasks,
        source: "local_fallback",
      });
      return;
    }

    const systemInstruction = `You are AI Life Admin's Multimodal Inbox Vision Agent.
Reference Current Date & Time: ${refDate}.
You analyze user-uploaded screenshots (emails, WhatsApp messages, syllabus snippets, project notices, utility bills, receipts, doctor prescriptions, meeting invites) or document snippets.

Tasks to perform:
1. Identify the document/screenshot type (e.g., "College Assignment Notice", "Utility Electricity Bill", "Doctor Prescription", "Work Slack Message", "Flight / Travel Booking").
2. Write a crisp 1-2 sentence executive summary of the content.
3. Extract all distinct actionable tasks with title, description, deadline, deadlineIso, category (College, Work, Finance, Personal, Shopping, Health, Other), priority (Urgent, High, Medium, Low), suggestedReminder, and related subtasks.

Return strictly JSON matching the specified schema.`;

    const parts: any[] = [];
    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
          mimeType: mimeType || "image/png",
        },
      });
    }

    const textPrompt = `Analyze this uploaded document/screenshot for actionable life tasks.\nFile Name: ${fileName || "Uploaded File"}\nAdditional Notes: ${text || "Extract all tasks, deadlines, and action items accurately."}`;
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            detectedDocumentType: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  deadlineIso: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    enum: ["College", "Work", "Finance", "Personal", "Shopping", "Health", "Other"],
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ["Urgent", "High", "Medium", "Low"],
                  },
                  suggestedReminder: { type: Type.STRING },
                  relatedTasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  confidenceScore: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING },
                },
                required: ["title", "category", "priority", "deadline"],
              },
            },
          },
          required: ["summary", "detectedDocumentType", "tasks"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      summary: parsed.summary || "Document parsed successfully.",
      detectedDocumentType: parsed.detectedDocumentType || "Document",
      tasks: parsed.tasks || [],
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Gemini inbox error:", error);
    const fallbackTasks = fallbackOrganize(req.body.text || req.body.fileName || "Uploaded Item", req.body.currentDate);
    res.json({
      summary: "Processed uploaded content using local heuristics.",
      detectedDocumentType: "Image / Document",
      tasks: fallbackTasks,
      source: "fallback_on_error",
      error: error.message,
    });
  }
});

// 3. AI Natural Language Search & Querying
app.post("/api/gemini/search", async (req, res) => {
  try {
    const { query, tasks, currentDate } = req.body;
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    const refDate = currentDate || new Date().toISOString();
    const taskList = Array.isArray(tasks) ? tasks : [];
    const ai = getGenAI();

    if (!ai) {
      // Local intelligent filtering fallback
      const q = query.toLowerCase();
      const matched = taskList.filter((t: any) => {
        if (q.includes("urgent") && t.priority === "Urgent") return true;
        if (q.includes("college") && t.category === "College") return true;
        if (q.includes("work") && t.category === "Work") return true;
        if (q.includes("finance") && t.category === "Finance") return true;
        if (q.includes("overdue") && (!t.completed && new Date(t.deadlineIso || t.createdAt) < new Date(refDate))) return true;
        if (q.includes("completed") && t.completed) return true;
        if (q.includes("this week") || q.includes("finish")) return !t.completed;
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.priority.toLowerCase().includes(q)
        );
      });

      res.json({
        answer: `I found ${matched.length} task(s) matching your query "${query}".`,
        matchedTaskIds: matched.map((t: any) => t.id),
        suggestedActions: [
          matched.length > 0 ? `Review the top priority: "${matched[0].title}"` : "Try searching by category or priority",
        ],
        filterAppliedSummary: `Local search filter applied for "${query}"`,
        source: "local_fallback",
      });
      return;
    }

    const systemInstruction = `You are AI Life Admin's Natural Language Task Query Engine.
Reference Current Date & Time: ${refDate}.
The user has provided a natural language query like "What do I need to finish this week?", "Show my urgent college tasks.", "What deadlines do I have this month?", or "What tasks are overdue?".

Analyze the user's task dataset, find the matching tasks by ID, write a friendly, concise executive answer, and provide 1-3 proactive productivity recommendations.

Return strictly JSON matching the response schema.`;

    const prompt = `User Query: "${query}"\n\nCurrent Tasks Dataset (JSON):\n${JSON.stringify(
      taskList.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        deadline: t.deadline,
        deadlineIso: t.deadlineIso,
        completed: t.completed,
      })),
      null,
      2
    )}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING, description: "Friendly, direct conversational answer explaining the results." },
            matchedTaskIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exact task IDs from the provided dataset that match the query criteria.",
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1 to 3 actionable next steps.",
            },
            filterAppliedSummary: { type: Type.STRING, description: "Short description of the criteria detected (e.g. Urgent + College + Pending)." },
          },
          required: ["answer", "matchedTaskIds", "suggestedActions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      answer: parsed.answer || "Here are the tasks that match your request.",
      matchedTaskIds: parsed.matchedTaskIds || [],
      suggestedActions: parsed.suggestedActions || [],
      filterAppliedSummary: parsed.filterAppliedSummary || "Criteria applied",
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Gemini search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. AI Insights & Productivity Diagnostics
app.post("/api/gemini/insights", async (req, res) => {
  try {
    const { tasks, currentDate } = req.body;
    const refDate = currentDate || new Date().toISOString();
    const taskList = Array.isArray(tasks) ? tasks : [];
    const ai = getGenAI();

    const pending = taskList.filter((t: any) => !t.completed);
    const urgent = pending.filter((t: any) => t.priority === "Urgent");
    const completed = taskList.filter((t: any) => t.completed);

    if (!ai) {
      res.json({
        summary: `You have ${urgent.length} urgent task(s) and ${pending.length} total pending item(s).`,
        productivityScore: Math.min(100, Math.max(30, Math.round((completed.length / Math.max(1, taskList.length)) * 100) + 40)),
        keyObservations: [
          `You have ${urgent.length} urgent priority task(s) needing focus today.`,
          `Category distribution: ${pending.filter((t: any) => t.category === "College").length} college items, ${pending.filter((t: any) => t.category === "Finance").length} finance items.`,
          `Task completion velocity is looking solid.`,
        ],
        productivitySuggestions: [
          "Tackle the highest priority urgent task before midday.",
          "Group related shopping and personal errands into a single time-block.",
          "Keep logging incoming messages in AI Inbox for zero information loss.",
        ],
        source: "local_fallback",
      });
      return;
    }

    const systemInstruction = `You are AI Life Admin's Chief Productivity Intelligence Officer.
Reference Current Date: ${refDate}.
Analyze the user's tasks and deliver high-value, non-generic productivity insights.
Highlight:
- Exact deadline workload (e.g., "You have 4 deadlines this week.")
- Dominant category concentration (e.g., "Most of your pending work is related to college.")
- Risk warnings (e.g., overdue tasks, urgent items without reminders)
- 3 specific, actionable productivity suggestions.
- Calculate an estimated Productivity & Readiness Score from 0 to 100 based on completion rate, urgency load, and organization.

Return strictly JSON matching the response schema.`;

    const prompt = `Analyze this life task portfolio:\n${JSON.stringify(
      taskList.map((t: any) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        deadline: t.deadline,
        deadlineIso: t.deadlineIso,
        completed: t.completed,
      })),
      null,
      2
    )}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Crisp 1-2 sentence overall state of affairs." },
            productivityScore: { type: Type.NUMBER, description: "Calculated score between 0 and 100" },
            keyObservations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-4 factual bullet points about workload and deadlines."
            },
            productivitySuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly tailored action tips to stay ahead."
            },
            categoryDistributionInsight: { type: Type.STRING },
          },
          required: ["summary", "productivityScore", "keyObservations", "productivitySuggestions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ ...parsed, source: "gemini" });
  } catch (error: any) {
    console.error("Gemini insights error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development and static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Life Admin server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
