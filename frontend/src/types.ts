// Simple types for the frontend
export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
  emoji?: string;
  completed: boolean;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  timeHorizon: 'Today' | 'This Week';
  createdAt: string;
  completedTasks: number;
  totalTasks: number;
}

export interface PlanState {
  currentPlan: Plan | null;
  plans: Plan[];
  isLoading: boolean;
  error: string | null;
  apiConnected: boolean;
}

export interface RootState {
  plan: PlanState;
}