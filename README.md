# PlanBuddy - Simple Goal to Plan App

A simple 2-screen Expo app that converts goals into structured, checkable task plans with a Node.js/Express backend proxy.

## Features

### Backend (Simple Proxy)
- **POST /plan** - Calls OpenAI's API to generate structured plans
- **GET /health** - Health check endpoint
- Returns tasks with title, dueDate, priority, notes, and emoji
- Works with or without OpenAI API key (uses mock data if no key)

### Frontend (2 Screens)

#### 1. Create Plan Screen
- Input: Short goal (e.g., "Get ready to launch an ecommerce store")
- Picker: Time horizon (Today / This Week)
- Button: Generate Plan → calls backend POST /plan

#### 2. Plan Screen
- Renders returned tasks with title, dueDate, priority, notes, emoji
- Mark tasks complete with tap
- Filter by priority (All/High/Medium/Low)
- Progress tracking
- Persists to device storage

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Add your OpenAI API key to .env (optional - works without it)
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npx expo start
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
        "title": "Research e-commerce platforms",
        "dueDate": "Monday",
        "priority": "High",
        "notes": "Compare Shopify, WooCommerce, etc.",
        "emoji": "🔍"
      }
    ]
  }
}
```

## Tech Stack

- **Frontend**: Expo, React Native, TypeScript, Redux Toolkit, Redux Persist
- **Backend**: Node.js, Express, TypeScript, OpenAI API
- **Storage**: AsyncStorage for local persistence

## Simple & Clean

This is a straightforward implementation focused on the core functionality:
- Clean TypeScript code
- Simple API proxy
- Two focused screens
- Local persistence
- Priority filtering
- Task completion tracking