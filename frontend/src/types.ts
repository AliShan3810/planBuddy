// Simple types for the frontend
export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  dueDate: string;   // YYYY-MM-DD
  priority: Priority;
  notes?: string;
  emoji?: string;
  completed?: boolean;
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
  theme: {
    themeMode: 'light' | 'dark';
  };
}