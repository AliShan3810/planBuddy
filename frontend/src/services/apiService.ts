import { Platform } from "react-native";

// Simple API service for the proxy
const EXPO_PUBLIC_API_BASE_URL = Platform.OS === 'ios' ? 'http://localhost:8787' : 'http://10.0.2.2:8787';

interface Task {
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
  emoji?: string;
}

interface StructuredPlan {
  title: string;
  description: string;
  tasks: Task[];
  timeHorizon: 'Today' | 'This Week';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiService {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${EXPO_PUBLIC_API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async generatePlan(goal: string, timeHorizon: 'Today' | 'This Week'): Promise<ApiResponse<StructuredPlan>> {
    return this.request('/plan', {
      method: 'POST',
      body: JSON.stringify({ goal, timeHorizon }),
    });
  }

  async checkHealth(): Promise<ApiResponse<{ status: string; timestamp: string; hasApiKey: boolean }>> {
    return this.request('/health');
  }
}

export default new ApiService();