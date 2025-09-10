// Simple types for the proxy
export interface GeneratePlanRequest {
  goal: string;
  timeHorizon: 'Today' | 'This Week';
}

export interface Task {
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
  emoji?: string;
}

export interface StructuredPlan {
  title: string;
  description: string;
  tasks: Task[];
  timeHorizon: 'Today' | 'This Week';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}