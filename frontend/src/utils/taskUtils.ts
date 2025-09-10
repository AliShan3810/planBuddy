import { Task, Priority } from '../types';

export type FilterPriority = 'All' | Priority;

export type SortOption = 'priority' | 'dueDate' | 'completion' | 'priorityThenDate';

/**
 * Filter tasks by priority
 */
export const filterTasksByPriority = (tasks: Task[], filterPriority: FilterPriority): Task[] => {
  if (filterPriority === 'All') {
    return tasks;
  }
  return tasks.filter(task => task.priority === filterPriority);
};

/**
 * Sort tasks by priority (High > Medium > Low)
 */
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
  
  return [...tasks].sort((a, b) => 
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );
};

/**
 * Sort tasks by due date (earliest first)
 */
export const sortTasksByDueDate = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
};

/**
 * Sort tasks by completion status (incomplete first)
 */
export const sortTasksByCompletion = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });
};

/**
 * Sort tasks by priority, then by due date for same priority
 */
export const sortTasksByPriorityThenDate = (tasks: Task[]): Task[] => {
  const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
  
  return [...tasks].sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

/**
 * Filter and sort tasks
 */
export const filterAndSortTasks = (
  tasks: Task[], 
  filterPriority: FilterPriority = 'All',
  sortOption: SortOption = 'priorityThenDate'
): Task[] => {
  let filteredTasks = filterTasksByPriority(tasks, filterPriority);
  
  switch (sortOption) {
    case 'priority':
      return sortTasksByPriority(filteredTasks);
    case 'dueDate':
      return sortTasksByDueDate(filteredTasks);
    case 'completion':
      return sortTasksByCompletion(filteredTasks);
    case 'priorityThenDate':
    default:
      return sortTasksByPriorityThenDate(filteredTasks);
  }
};

/**
 * Get task statistics
 */
export const getTaskStatistics = (tasks: Task[]) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return {
    completedTasks,
    totalTasks,
    completionPercentage,
    incompleteTasks: totalTasks - completedTasks,
  };
};

/**
 * Get priority color for UI
 */
export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'High': return '#ef4444';
    case 'Medium': return '#f59e0b';
    case 'Low': return '#10b981';
    default: return '#6b7280';
  }
};
