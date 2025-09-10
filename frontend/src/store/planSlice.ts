import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/apiService';
import { Plan, PlanState, Task } from '../types';

const initialState: PlanState = {
  currentPlan: null,
  plans: [],
  isLoading: false,
  error: null,
  apiConnected: false,
};

// Async thunks
export const generatePlanFromGoal = createAsyncThunk(
  'plan/generatePlanFromGoal',
  async ({ goal, timeHorizon }: { goal: string; timeHorizon: 'Today' | 'This Week' }) => {
    const response = await apiService.generatePlan(goal, timeHorizon);
    return response.data;
  }
);

export const checkApiHealth = createAsyncThunk(
  'plan/checkApiHealth',
  async () => {
    const response = await apiService.checkHealth();
    return response.data;
  }
);

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    updateTaskStatus: (state, action) => {
      const { taskId, completed } = action.payload;
      if (state.currentPlan) {
        const task = state.currentPlan.tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = completed;
          state.currentPlan.completedTasks = state.currentPlan.tasks.filter(t => t.completed).length;
        }
      }
    },
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePlanFromGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generatePlanFromGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        const generatedPlan: Plan = {
          id: Date.now().toString(),
          title: action.payload.title,
          description: action.payload.description,
          tasks: action.payload.tasks.map((task: any, index: number) => ({
            id: `${Date.now()}_${index}`,
            title: task.title,
            dueDate: task.dueDate,
            priority: task.priority,
            notes: task.notes,
            emoji: task.emoji,
            completed: false,
          })),
          timeHorizon: action.payload.timeHorizon,
          createdAt: new Date().toISOString(),
          completedTasks: 0,
          totalTasks: action.payload.tasks.length,
        };
        state.currentPlan = generatedPlan;
        state.plans.unshift(generatedPlan);
      })
      .addCase(generatePlanFromGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to generate plan';
      })
      .addCase(checkApiHealth.fulfilled, (state, action) => {
        state.apiConnected = action.payload.hasApiKey;
      });
  },
});

export const { updateTaskStatus, clearCurrentPlan, clearError } = planSlice.actions;
export default planSlice.reducer;