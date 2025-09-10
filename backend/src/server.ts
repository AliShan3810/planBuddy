import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import {
  GeneratePlanRequest,
  StructuredPlan,
  ApiResponse,
  Task,
} from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI API configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    hasApiKey: !!OPENAI_API_KEY,
  });
});

// Generate plan endpoint
app.post("/plan", async (req: Request, res: Response) => {
  try {
    const { goal, timeHorizon }: GeneratePlanRequest = req.body;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({
        success: false,
        message: "Goal is required and must be a string",
      } as ApiResponse<null>);
    }

    if (!timeHorizon || !["Today", "This Week"].includes(timeHorizon)) {
      return res.status(400).json({
        success: false,
        message: 'Time horizon must be either "Today" or "This Week"',
      } as ApiResponse<null>);
    }

    if (!OPENAI_API_KEY) {
      // Return mock data if no API key
      const mockTasks: Task[] = [
        {
          title: `Research and understand ${goal}`,
          dueDate: timeHorizon === "Today" ? "Today" : "Monday",
          priority: "High",
          emoji: "🔍",
          notes: "Start with basic research",
        },
        {
          title: `Create a detailed action plan`,
          dueDate: timeHorizon === "Today" ? "Today" : "Tuesday",
          priority: "High",
          emoji: "📋",
          notes: "Break down into smaller steps",
        },
        {
          title: `Begin implementation`,
          dueDate: timeHorizon === "Today" ? "Today" : "Wednesday",
          priority: "Medium",
          emoji: "🚀",
          notes: "Start with the first task",
        },
        {
          title: `Monitor and adjust progress`,
          dueDate: timeHorizon === "Today" ? "Today" : "Thursday",
          priority: "Medium",
          emoji: "📊",
          notes: "Check progress regularly",
        },
        {
          title: `Complete and review results`,
          dueDate: timeHorizon === "Today" ? "Today" : "Friday",
          priority: "Low",
          emoji: "✅",
          notes: "Final review and cleanup",
        },
      ];

      const mockPlan: StructuredPlan = {
        title: goal,
        description: `A structured plan to achieve: ${goal}`,
        tasks: mockTasks,
        timeHorizon,
      };

      return res.json({
        success: true,
        data: mockPlan,
        message: "Plan generated (mock data - no API key configured)",
      } as ApiResponse<StructuredPlan>);
    }

    // Create prompt for OpenAI
    const prompt = `Create a structured action plan for the following goal:

Goal: ${goal}
Time Horizon: ${timeHorizon}

Please provide a JSON response with the following exact structure:
{
  "title": "Clear, actionable title for the plan",
  "description": "Brief description of the plan",
  "tasks": [
    {
      "title": "Specific, actionable task 1",
      "dueDate": "${timeHorizon === "Today" ? "Today" : "Monday"}",
      "priority": "High|Medium|Low",
      "notes": "Optional helpful notes",
      "emoji": "🔍"
    },
    {
      "title": "Specific, actionable task 2", 
      "dueDate": "${timeHorizon === "Today" ? "Today" : "Tuesday"}",
      "priority": "High|Medium|Low",
      "notes": "Optional helpful notes",
      "emoji": "📋"
    },
    {
      "title": "Specific, actionable task 3",
      "dueDate": "${timeHorizon === "Today" ? "Today" : "Wednesday"}",
      "priority": "High|Medium|Low", 
      "notes": "Optional helpful notes",
      "emoji": "🚀"
    },
    {
      "title": "Specific, actionable task 4",
      "dueDate": "${timeHorizon === "Today" ? "Today" : "Thursday"}",
      "priority": "High|Medium|Low",
      "notes": "Optional helpful notes", 
      "emoji": "📊"
    },
    {
      "title": "Specific, actionable task 5",
      "dueDate": "${timeHorizon === "Today" ? "Today" : "Friday"}",
      "priority": "High|Medium|Low",
      "notes": "Optional helpful notes",
      "emoji": "✅"
    }
  ],
  "timeHorizon": "${timeHorizon}"
}

Make sure each task is:
- Specific and actionable
- Has appropriate priority (High for critical tasks)
- Has relevant emoji and helpful notes
- Due dates should be distributed across the time horizon

Return only valid JSON, no additional text.`;

    // Call OpenAI API
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Parse the response
    const content = response.data.choices[0].message.content;
    let planData: StructuredPlan;

    try {
      planData = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback plan
      const fallbackTasks: Task[] = [
        {
          title: `Research and understand ${goal}`,
          dueDate: timeHorizon === "Today" ? "Today" : "Monday",
          priority: "High",
          emoji: "🔍",
          notes: "Start with basic research",
        },
        {
          title: `Create a detailed action plan`,
          dueDate: timeHorizon === "Today" ? "Today" : "Tuesday",
          priority: "High",
          emoji: "📋",
          notes: "Break down into smaller steps",
        },
        {
          title: `Begin implementation`,
          dueDate: timeHorizon === "Today" ? "Today" : "Wednesday",
          priority: "Medium",
          emoji: "🚀",
          notes: "Start with the first task",
        },
        {
          title: `Monitor and adjust progress`,
          dueDate: timeHorizon === "Today" ? "Today" : "Thursday",
          priority: "Medium",
          emoji: "📊",
          notes: "Check progress regularly",
        },
        {
          title: `Complete and review results`,
          dueDate: timeHorizon === "Today" ? "Today" : "Friday",
          priority: "Low",
          emoji: "✅",
          notes: "Final review and cleanup",
        },
      ];

      planData = {
        title: goal,
        description: `A structured plan to achieve: ${goal}`,
        tasks: fallbackTasks,
        timeHorizon,
      };
    }

    res.json({
      success: true,
      data: planData,
      message: "Plan generated successfully",
    } as ApiResponse<StructuredPlan>);
  } catch (error) {
    console.error("Error generating plan:", error);

    // Return fallback plan on error
    const fallbackTasks: Task[] = [
      {
        title: "Research and understand the goal",
        dueDate: "Today",
        priority: "High",
        emoji: "🔍",
        notes: "Start with basic research",
      },
      {
        title: "Create a detailed action plan",
        dueDate: "Today",
        priority: "High",
        emoji: "📋",
        notes: "Break down into smaller steps",
      },
      {
        title: "Begin implementation",
        dueDate: "Today",
        priority: "Medium",
        emoji: "🚀",
        notes: "Start with the first task",
      },
    ];

    const fallbackPlan: StructuredPlan = {
      title: req.body.goal || "Goal",
      description: "A structured plan to achieve your goal",
      tasks: fallbackTasks,
      timeHorizon: "Today",
    };

    res.json({
      success: true,
      data: fallbackPlan,
      message: "Plan generated (fallback due to API error)",
    } as ApiResponse<StructuredPlan>);
  }
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  } as ApiResponse<null>);
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(
    `📡 OpenAI API configured: ${
      OPENAI_API_KEY ? "Yes" : "No (using mock data)"
    }`
  );
});

export default app;
