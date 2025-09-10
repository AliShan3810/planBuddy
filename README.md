# PlanBuddy - Simple Goal to Plan App

A simple 2-screen Expo app that converts goals into structured, checkable task plans with a Node.js/Express backend proxy.

## Features

### Backend (Simple Proxy)
- **POST /plan** - Calls OpenAI's API to generate structured plans
- **GET /health** - Health check endpoint
- Returns tasks with title, dueDate, priority, notes, and emoji
- Works with or without OpenAI API key (uses mock data if no key)

### Frontend (3 Screens)

#### 1. Create Plan Screen
- Input: Short goal (e.g., "Get ready to launch an ecommerce store")
- Picker: Time horizon (Today / This Week)
- Button: Generate Plan → calls backend POST /plan
- Input validation with real-time feedback
- ScrollView support for small devices
- "View Previous Plans" navigation

#### 2. Plan Screen
- Renders returned tasks with title, dueDate, priority, notes, emoji
- Mark tasks complete with tap
- Filter by priority (All/High/Medium/Low)
- Progress tracking
- Persists to device storage
- "View All Plans" navigation

#### 3. History Screen
- View all previously generated plans
- Navigate to any plan
- Delete plans
- Shows plan progress and task previews

#### 4. Theme System
- Light/Dark mode toggle on all screens
- Simple two-mode theme switching
- Persistent theme preference
- Theme-aware colors throughout the app

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator (optional)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your OpenAI API key to .env (optional - works without it)
# OPENAI_API_KEY=your_api_key_here

# Start development server
npm run dev
# Server runs on http://localhost:8787
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Follow the prompts to:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

### Running Both Together
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npx expo start
```

## API Structure

### Request
```json
POST /plan
{
  "goal": "Get ready to launch an ecommerce store",
  "timeHorizon": "This Week"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "title": "E-commerce Store Launch Plan",
    "description": "A structured plan to launch your e-commerce store",
    "timeHorizon": "This Week",
    "tasks": [
      {
        "id": "task-1",
        "title": "Research e-commerce platforms",
        "dueDate": "Monday",
        "priority": "High",
        "notes": "Compare Shopify, WooCommerce, etc.",
        "emoji": "🔍",
        "completed": false
      }
    ]
  }
}
```

## Tech Stack

- **Frontend**: Expo, React Native, TypeScript, Redux Toolkit, Redux Persist
- **Backend**: Node.js, Express, TypeScript, OpenAI API
- **Storage**: AsyncStorage for local persistence

## Deviations from Original Spec

### What Changed & Why

#### 1. **Added History Screen (3rd Screen)**
- **Original**: 2-screen app (Create Plan + Plan)
- **Current**: 3-screen app (Create Plan + Plan + History)
- **Why**: User requested ability to view all previously generated plans
- **Time Tradeoff**: +2 hours development time for better UX

#### 2. **Enhanced Input Validation**
- **Original**: Basic form submission
- **Current**: Real-time validation with visual feedback
- **Why**: User requested validation for empty fields
- **Time Tradeoff**: +1 hour for better form UX

#### 3. **ScrollView Implementation**
- **Original**: Basic View containers
- **Current**: ScrollView for small devices
- **Why**: User requested support for small devices
- **Time Tradeoff**: +30 minutes for responsive design

#### 4. **Robust Error Handling**
- **Original**: Basic API calls
- **Current**: Retry mechanisms, fallback data, comprehensive validation
- **Why**: OpenAI API can be unreliable, needed robust handling
- **Time Tradeoff**: +2 hours for production-ready reliability

#### 5. **Enhanced State Management**
- **Original**: Simple Redux setup
- **Current**: Complex persistence with dual state updates
- **Why**: Task completion needed to persist across app restarts
- **Time Tradeoff**: +1.5 hours for proper data persistence

#### 6. **Type System Consistency**
- **Original**: Basic TypeScript interfaces
- **Current**: Comprehensive type definitions with strict validation
- **Why**: Ensured type safety across frontend and backend
- **Time Tradeoff**: +1 hour for robust type system

#### 7. **Light/Dark Theme System**
- **Original**: Single light theme
- **Current**: Complete theme system with light/dark modes
- **Why**: User requested modern theme support for better UX
- **Time Tradeoff**: +2 hours for comprehensive theming

## State Management & Persistence

### Redux Store Structure
```typescript
{
  plan: {
    currentPlan: StructuredPlan | null,    // Currently viewed plan
    plans: StructuredPlan[],               // All generated plans
    loading: boolean,                      // API loading state
    error: string | null                   // Error messages
  },
  theme: {
    themeMode: 'light' | 'dark' // Theme preference
  }
}
```

### Type Definitions
```typescript
type Priority = 'High' | 'Medium' | 'Low';

interface Task {
  id: string;                              // Unique task identifier
  title: string;                           // Task description
  dueDate: string;                         // YYYY-MM-DD format
  priority: Priority;                      // High, Medium, or Low
  notes?: string;                          // Optional task notes
  emoji?: string;                          // Optional emoji
  completed?: boolean;                     // Task completion status
}

interface StructuredPlan {
  title: string;                           // Plan title
  description: string;                     // Plan description
  tasks: Task[];                           // Array of tasks
  timeHorizon: 'Today' | 'This Week';     // Time scope
}
```

### Where Persistence Lives

#### 1. **Redux Persist Configuration**
- **File**: `frontend/src/store/index.ts`
- **Storage**: AsyncStorage (React Native's local storage)
- **Key**: `'planbuddy-storage'`
- **What's Persisted**: Entire Redux state (currentPlan + plans array)

#### 2. **Dual State Updates**
- **File**: `frontend/src/store/planSlice.ts`
- **Logic**: When task is completed, updates BOTH:
  - `currentPlan.tasks[].completed` (for current view)
  - `plans[].tasks[].completed` (for persistence)
- **Why**: Ensures task completion persists across app restarts

#### 3. **Type-Safe Task Management**
- **File**: `frontend/src/types.ts` & `backend/src/types.ts`
- **Logic**: Consistent Task interface with required `id` and optional `completed`
- **Why**: Ensures type safety and proper task identification across the app

#### 4. **Automatic Persistence**
- **No Manual Flush**: Redux Persist handles saving automatically
- **Serialization**: Configured to ignore non-serializable Redux actions
- **Performance**: Optimized for automatic state persistence

#### 5. **Theme Persistence**
- **File**: `frontend/src/store/themeSlice.ts`
- **Storage**: AsyncStorage with separate persistence key
- **Logic**: Theme preference persists across app restarts
- **Why**: Users expect their theme choice to be remembered

### Data Flow
1. **User Action** → Redux Action → State Update
2. **Redux Persist** → Automatic Save to AsyncStorage
3. **App Restart** → Redux Persist → Restore from AsyncStorage
4. **UI Updates** → Reflects persisted state

## Simple & Clean

This is a straightforward implementation focused on the core functionality:
- Clean TypeScript code
- Simple API proxy
- Three focused screens
- Local persistence
- Priority filtering
- Task completion tracking
- Robust error handling
- Light/Dark theme support