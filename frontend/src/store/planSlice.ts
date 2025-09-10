import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/apiService';
import { Plan, PlanState } from '../types';

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
      
      // Update current plan
      if (state.currentPlan) {
        const task = state.currentPlan.tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = completed;
          state.currentPlan.completedTasks = state.currentPlan.tasks.filter(t => t.completed).length;
        }
      }
      
      // Update the same task in the plans array to maintain persistence
      state.plans.forEach(plan => {
        const task = plan.tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = completed;
          plan.completedTasks = plan.tasks.filter(t => t.completed).length;
        }
      });
    },
    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload;
    },
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
    deletePlan: (state, action) => {
      const planId = action.payload;
      state.plans = state.plans.filter(plan => plan.id !== planId);
      if (state.currentPlan?.id === planId) {
        state.currentPlan = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    // Debug action to check persistence
    debugState: (state) => {
      console.log('Current Redux State:', JSON.stringify(state, null, 2));
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
        // The error message from the backend API is in action.payload
        state.error = (action.payload as string) || action.error?.message || 'Failed to generate plan';
      })
      .addCase(checkApiHealth.fulfilled, (state, action) => {
        state.apiConnected = action.payload.hasApiKey;
      });
  },
});

export const { updateTaskStatus, setCurrentPlan, clearCurrentPlan, deletePlan, clearError, debugState } = planSlice.actions;
export default planSlice.reducer;