// Simple types for the proxy
export type Priority = 'High' | 'Medium' | 'Low';

export interface GeneratePlanRequest {
  goal: string;
  timeHorizon: 'Today' | 'This Week';
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;   // YYYY-MM-DD
  priority: Priority;
  notes?: string;
  emoji?: string;
  completed?: boolean;
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