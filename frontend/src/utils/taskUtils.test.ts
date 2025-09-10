import { Task, Priority } from '../types';
import { 
  filterTasksByPriority, 
  sortTasksByPriority, 
  sortTasksByDueDate,
  sortTasksByCompletion,
  sortTasksByPriorityThenDate,
  filterAndSortTasks,
  getTaskStatistics,
  getPriorityColor,
  FilterPriority
} from './taskUtils';

// Mock task data for testing
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'High priority task',
    dueDate: '2024-01-15',
    priority: 'High' as Priority,
    notes: 'Important task',
    emoji: '🔥',
    completed: false,
  },
  {
    id: '2',
    title: 'Medium priority task',
    dueDate: '2024-01-20',
    priority: 'Medium' as Priority,
    notes: 'Regular task',
    emoji: '📝',
    completed: true,
  },
  {
    id: '3',
    title: 'Low priority task',
    dueDate: '2024-01-25',
    priority: 'Low' as Priority,
    notes: 'Optional task',
    emoji: '💡',
    completed: false,
  },
  {
    id: '4',
    title: 'Another high priority task',
    dueDate: '2024-01-10',
    priority: 'High' as Priority,
    notes: 'Another important task',
    emoji: '⚡',
    completed: true,
  },
];

describe('Task Utils', () => {
  describe('filterTasksByPriority', () => {
    test('should filter tasks by High priority', () => {
      const filteredTasks = filterTasksByPriority(mockTasks, 'High');
      
      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks[0]?.title).toBe('High priority task');
      expect(filteredTasks[1]?.title).toBe('Another high priority task');
      expect(filteredTasks.every(task => task.priority === 'High')).toBe(true);
    });

    test('should filter tasks by Medium priority', () => {
      const filteredTasks = filterTasksByPriority(mockTasks, 'Medium');
      
      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0]?.title).toBe('Medium priority task');
      expect(filteredTasks[0]?.priority).toBe('Medium');
    });

    test('should filter tasks by Low priority', () => {
      const filteredTasks = filterTasksByPriority(mockTasks, 'Low');
      
      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0]?.title).toBe('Low priority task');
      expect(filteredTasks[0]?.priority).toBe('Low');
    });

    test('should return all tasks when filtering by All', () => {
      const filteredTasks = filterTasksByPriority(mockTasks, 'All');
      
      expect(filteredTasks).toHaveLength(4);
      expect(filteredTasks).toEqual(mockTasks);
    });

    test('should return empty array when filtering by non-existent priority', () => {
      const filteredTasks = filterTasksByPriority(mockTasks, 'NonExistent' as FilterPriority);
      
      expect(filteredTasks).toHaveLength(0);
    });

    test('should handle empty task array', () => {
      const filteredTasks = filterTasksByPriority([], 'High');
      
      expect(filteredTasks).toHaveLength(0);
    });
  });

  describe('sortTasksByPriority', () => {
    test('should sort tasks by priority (High > Medium > Low)', () => {
      const sortedTasks = sortTasksByPriority(mockTasks);
      
      expect(sortedTasks[0]?.priority).toBe('High');
      expect(sortedTasks[1]?.priority).toBe('High');
      expect(sortedTasks[2]?.priority).toBe('Medium');
      expect(sortedTasks[3]?.priority).toBe('Low');
    });

    test('should handle empty task array', () => {
      const sortedTasks = sortTasksByPriority([]);
      
      expect(sortedTasks).toHaveLength(0);
    });
  });

  describe('sortTasksByDueDate', () => {
    test('should sort tasks by due date (earliest first)', () => {
      const sortedTasks = sortTasksByDueDate(mockTasks);
      
      expect(sortedTasks[0]?.dueDate).toBe('2024-01-10');
      expect(sortedTasks[1]?.dueDate).toBe('2024-01-15');
      expect(sortedTasks[2]?.dueDate).toBe('2024-01-20');
      expect(sortedTasks[3]?.dueDate).toBe('2024-01-25');
    });
  });

  describe('sortTasksByCompletion', () => {
    test('should sort tasks by completion status (incomplete first)', () => {
      const sortedTasks = sortTasksByCompletion(mockTasks);
      
      expect(sortedTasks[0]?.completed).toBe(false);
      expect(sortedTasks[1]?.completed).toBe(false);
      expect(sortedTasks[2]?.completed).toBe(true);
      expect(sortedTasks[3]?.completed).toBe(true);
    });
  });

  describe('sortTasksByPriorityThenDate', () => {
    test('should sort tasks by priority then by due date', () => {
      const sortedTasks = sortTasksByPriorityThenDate(mockTasks);
      
      // High priority tasks should come first, sorted by due date
      expect(sortedTasks[0]?.priority).toBe('High');
      expect(sortedTasks[0]?.dueDate).toBe('2024-01-10');
      expect(sortedTasks[1]?.priority).toBe('High');
      expect(sortedTasks[1]?.dueDate).toBe('2024-01-15');
      expect(sortedTasks[2]?.priority).toBe('Medium');
      expect(sortedTasks[3]?.priority).toBe('Low');
    });
  });

  describe('filterAndSortTasks', () => {
    test('should filter and sort tasks by priority', () => {
      const result = filterAndSortTasks(mockTasks, 'High', 'priority');
      
      expect(result).toHaveLength(2);
      expect(result.every(task => task.priority === 'High')).toBe(true);
    });

    test('should filter and sort tasks by due date', () => {
      const result = filterAndSortTasks(mockTasks, 'All', 'dueDate');
      
      expect(result).toHaveLength(4);
      expect(result[0]?.dueDate).toBe('2024-01-10');
      expect(result[3]?.dueDate).toBe('2024-01-25');
    });

    test('should use default sorting when no sort option provided', () => {
      const result = filterAndSortTasks(mockTasks, 'All');
      
      expect(result).toHaveLength(4);
      expect(result[0]?.priority).toBe('High');
    });
  });

  describe('getTaskStatistics', () => {
    test('should count completed tasks correctly', () => {
      const stats = getTaskStatistics(mockTasks);
      
      expect(stats.completedTasks).toBe(2);
      expect(stats.completedTasks).toBe(mockTasks.filter(task => task.completed).length);
    });

    test('should count total tasks correctly', () => {
      const stats = getTaskStatistics(mockTasks);
      
      expect(stats.totalTasks).toBe(4);
      expect(stats.totalTasks).toBe(mockTasks.length);
    });

    test('should calculate completion percentage correctly', () => {
      const stats = getTaskStatistics(mockTasks);
      
      expect(stats.completionPercentage).toBe(50); // 2 out of 4 tasks completed
    });

    test('should calculate incomplete tasks correctly', () => {
      const stats = getTaskStatistics(mockTasks);
      
      expect(stats.incompleteTasks).toBe(2);
      expect(stats.incompleteTasks).toBe(mockTasks.filter(task => !task.completed).length);
    });

    test('should handle empty task array', () => {
      const stats = getTaskStatistics([]);
      
      expect(stats.completedTasks).toBe(0);
      expect(stats.totalTasks).toBe(0);
      expect(stats.completionPercentage).toBe(0);
      expect(stats.incompleteTasks).toBe(0);
    });

    test('should handle all tasks completed', () => {
      const allCompletedTasks = mockTasks.map(task => ({ ...task, completed: true }));
      const stats = getTaskStatistics(allCompletedTasks);
      
      expect(stats.completedTasks).toBe(4);
      expect(stats.completionPercentage).toBe(100);
      expect(stats.incompleteTasks).toBe(0);
    });

    test('should handle no tasks completed', () => {
      const noCompletedTasks = mockTasks.map(task => ({ ...task, completed: false }));
      const stats = getTaskStatistics(noCompletedTasks);
      
      expect(stats.completedTasks).toBe(0);
      expect(stats.completionPercentage).toBe(0);
      expect(stats.incompleteTasks).toBe(4);
    });
  });

  describe('getPriorityColor', () => {
    test('should return correct color for High priority', () => {
      expect(getPriorityColor('High')).toBe('#ef4444');
    });

    test('should return correct color for Medium priority', () => {
      expect(getPriorityColor('Medium')).toBe('#f59e0b');
    });

    test('should return correct color for Low priority', () => {
      expect(getPriorityColor('Low')).toBe('#10b981');
    });

    test('should return default color for unknown priority', () => {
      expect(getPriorityColor('Unknown' as Priority)).toBe('#6b7280');
    });
  });
});
