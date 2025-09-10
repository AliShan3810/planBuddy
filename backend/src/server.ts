import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import {
  GeneratePlanRequest,
  StructuredPlan,
  ApiResponse,
  Task,
} from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    hasApiKey: !!OPENAI_API_KEY,
  });
});

// Helper function to create fallback tasks
const createFallbackTasks = (goal: string, timeHorizon: string): Task[] => {
  const isToday = timeHorizon === "Today";
  const days = isToday ? ["Today"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  return [
    {
      id: `task-${Date.now()}-1`,
      title: `Research and understand ${goal}`,
      dueDate: days[0],
      priority: "High" as const,
      emoji: "🔍",
      notes: "Start with basic research and understanding",
      completed: false,
    },
    {
      id: `task-${Date.now()}-2`,
      title: `Create a detailed action plan`,
      dueDate: days[1] || days[0],
      priority: "High" as const,
      emoji: "📋",
      notes: "Break down into smaller, manageable steps",
      completed: false,
    },
    {
      id: `task-${Date.now()}-3`,
      title: `Begin implementation`,
      dueDate: days[2] || days[1] || days[0],
      priority: "Medium" as const,
      emoji: "🚀",
      notes: "Start with the first actionable task",
      completed: false,
    },
    {
      id: `task-${Date.now()}-4`,
      title: `Monitor and adjust progress`,
      dueDate: days[3] || days[2] || days[1] || days[0],
      priority: "Medium" as const,
      emoji: "📊",
      notes: "Check progress and make adjustments as needed",
      completed: false,
    },
    {
      id: `task-${Date.now()}-5`,
      title: `Complete and review results`,
      dueDate: days[4] || days[3] || days[2] || days[1] || days[0],
      priority: "Low" as const,
      emoji: "✅",
      notes: "Final review and cleanup of the project",
      completed: false,
    },
  ].filter((_, index) => index < (isToday ? 3 : 5)); // Limit tasks based on time horizon
};

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

    if (!openai) {
      // Return mock data if no API key
      const mockTasks = createFallbackTasks(goal, timeHorizon);

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

    // Helper function to create dynamic prompt
    const createDynamicPrompt = (goal: string, timeHorizon: string) => {
      const isToday = timeHorizon === "Today";
      const timeContext = isToday 
        ? "within the next 24 hours" 
        : "over the next 7 days";
      
      const urgencyLevel = isToday ? "urgent and immediate" : "well-planned and achievable";
      const taskCount = isToday ? "3-4" : "5-6";
      
      return `You are an expert productivity coach and project manager. Create a detailed, actionable plan to help someone achieve their goal.

GOAL: "${goal}"
TIME HORIZON: ${timeHorizon} (${timeContext})

Create a structured plan that is ${urgencyLevel}. The plan should be realistic and achievable ${timeContext}.

REQUIREMENTS:
- Generate exactly ${taskCount} specific, actionable tasks
- Each task should be clear, measurable, and directly contribute to the goal
- Prioritize tasks logically (High priority for critical/foundational tasks)
- Include helpful notes and relevant emojis for each task
- Distribute due dates appropriately across the time horizon
- Make tasks specific to the goal, not generic advice

RESPONSE FORMAT (return ONLY valid JSON):
{
  "title": "Clear, compelling title for the plan",
  "description": "Brief 1-2 sentence description of what this plan will achieve",
  "tasks": [
    {
      "id": "task-1",
      "title": "Specific actionable task 1",
      "dueDate": "${isToday ? "Today" : "Monday"}",
      "priority": "High|Medium|Low",
      "notes": "Helpful context, tips, or sub-steps",
      "emoji": "🔍",
      "completed": false
    }
  ],
  "timeHorizon": "${timeHorizon}"
}

PRIORITY GUIDELINES:
- High: Critical tasks that must be done first or are blocking other tasks
- Medium: Important tasks that support the main goal
- Low: Nice-to-have tasks or final touches

EMOJI SUGGESTIONS: 🔍📋🚀📊✅💡🎯📝🔧📱💰🎨📈🔒📦

Make this plan practical and immediately actionable. Focus on concrete steps rather than abstract concepts.`;
    };

    if (!openai) {
      // Return mock data if no API key
      const mockTasks: Task[] = [
        {
          id: `mock-task-${Date.now()}-1`,
          title: `Research and understand ${goal}`,
          dueDate: timeHorizon === "Today" ? "Today" : "Monday",
          priority: "High",
          emoji: "🔍",
          notes: "Start with basic research",
          completed: false,
        },
        {
          id: `mock-task-${Date.now()}-2`,
          title: `Create a detailed action plan`,
          dueDate: timeHorizon === "Today" ? "Today" : "Tuesday",
          priority: "High",
          emoji: "📋",
          notes: "Break down into smaller steps",
          completed: false,
        },
        {
          id: `mock-task-${Date.now()}-3`,
          title: `Begin implementation`,
          dueDate: timeHorizon === "Today" ? "Today" : "Wednesday",
          priority: "Medium",
          emoji: "🚀",
          notes: "Start with the first task",
          completed: false,
        },
        {
          id: `mock-task-${Date.now()}-4`,
          title: `Monitor and adjust progress`,
          dueDate: timeHorizon === "Today" ? "Today" : "Thursday",
          priority: "Medium",
          emoji: "📊",
          notes: "Check progress regularly",
          completed: false,
        },
        {
          id: `mock-task-${Date.now()}-5`,
          title: `Complete and review results`,
          dueDate: timeHorizon === "Today" ? "Today" : "Friday",
          priority: "Low",
          emoji: "✅",
          notes: "Final review and cleanup",
          completed: false,
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

    // Create dynamic prompt
    const prompt = createDynamicPrompt(goal, timeHorizon);

    // Call OpenAI API with retry mechanism
    let completion;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Using the latest efficient model
          messages: [
            {
              role: "system",
              content: "You are an expert productivity coach. Always respond with valid JSON only, no additional text or explanations."
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
          response_format: { type: "json_object" }, // Ensure JSON response
        });
        break; // Success, exit retry loop
      } catch (apiError) {
        attempts++;
        const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error';
        console.warn(`⚠️ OpenAI API attempt ${attempts} failed:`, errorMessage);
        
        if (attempts >= maxAttempts) {
          throw apiError; // Re-throw if all attempts failed
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Parse and validate the response
    const content = completion?.choices[0]?.message?.content;
    let planData: StructuredPlan;

    try {
      // Attempt to parse JSON
      const parsedContent = JSON.parse(content || '{}');
      
      // Validate the structure
      if (!parsedContent.title || !parsedContent.tasks || !Array.isArray(parsedContent.tasks)) {
        throw new Error('Invalid plan structure received from AI');
      }

      // Validate each task has required fields
      const validTasks = parsedContent.tasks.filter((task: any) => 
        task.id && task.title && task.dueDate && task.priority && task.emoji
      );

      if (validTasks.length === 0) {
        throw new Error('No valid tasks found in AI response');
      }

      planData = {
        title: parsedContent.title,
        description: parsedContent.description || `A structured plan to achieve: ${goal}`,
        tasks: validTasks,
        timeHorizon: parsedContent.timeHorizon || timeHorizon,
      };

      console.log(`✅ Successfully parsed AI response with ${validTasks.length} tasks`);

    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      console.warn('⚠️ JSON parsing failed, using fallback plan:', errorMessage);
      
      // Create a robust fallback plan
      const fallbackTasks: Task[] = createFallbackTasks(goal, timeHorizon);
      
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
    console.error("❌ Error generating plan:", error);

    // Create fallback plan using the helper function
    const fallbackTasks = createFallbackTasks(
      req.body.goal || "Your Goal", 
      req.body.timeHorizon || "Today"
    );

    const fallbackPlan: StructuredPlan = {
      title: req.body.goal || "Your Goal",
      description: "A structured plan to achieve your goal (generated as fallback)",
      tasks: fallbackTasks,
      timeHorizon: req.body.timeHorizon || "Today",
    };

    res.json({
      success: true,
      data: fallbackPlan,
      message: "Plan generated (fallback due to API error - this is normal and expected occasionally)",
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
      openai ? "Yes (using OpenAI library)" : "No (using mock data)"
    }`
  );
  if (openai) {
    console.log(`🤖 Using GPT-4o-mini model with dynamic prompts`);
  }
});

export default app;
