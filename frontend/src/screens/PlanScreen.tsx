import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateTaskStatus, clearCurrentPlan } from '../store/planSlice';
import { RootState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

export default function PlanScreen({ navigation }: any) {
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  
  const dispatch = useDispatch();
  const { currentPlan } = useSelector((state: RootState) => state.plan);
  const { theme } = useTheme();

  useEffect(() => {
    if (!currentPlan) {
      Alert.alert(
        'No Plan Found',
        'No plan found. Let\'s create one!',
        [
          {
            text: 'Create Plan',
            onPress: () => navigation.navigate('CreatePlan'),
          },
        ]
      );
    }
  }, [currentPlan, navigation]);

  const handleTaskToggle = (taskIndex: number) => {
    if (currentPlan && currentPlan.tasks[taskIndex]) {
      const task = currentPlan.tasks[taskIndex];
      
      dispatch(updateTaskStatus({
        taskId: task.id,
        completed: !task.completed
      }));
    }
  };

  const renderTaskItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { 
          backgroundColor: theme.colors.card, 
          borderColor: theme.colors.border,
          opacity: item.completed ? 0.7 : 1
        }
      ]}
      onPress={() => handleTaskToggle(index)}
    >
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskEmoji}>{item.emoji}</Text>
            <Text style={[
              styles.taskTitle,
              { color: theme.colors.text },
              item.completed && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }
            ]}>
              {item.title}
            </Text>
          </View>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) }
          ]}>
            <Text style={[styles.priorityText, { color: '#FFFFFF' }]}>{item.priority}</Text>
          </View>
        </View>
        
        <View style={styles.taskDetails}>
          <Text style={[styles.dueDate, { color: theme.colors.textSecondary }]}>Due: {item.dueDate}</Text>
          {item.notes && (
            <Text style={[styles.taskNotes, { color: theme.colors.textSecondary }]}>{item.notes}</Text>
          )}
        </View>
      </View>
      
      <View style={[
        styles.checkbox,
        { borderColor: theme.colors.border },
        item.completed && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
      ]}>
        {item.completed && <Text style={[styles.checkmark, { color: theme.colors.buttonText }]}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  const handleClearPlan = () => {
    Alert.alert(
      'Clear Plan',
      'Are you sure you want to clear this plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCurrentPlan());
            navigation.navigate('CreatePlan');
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredTasks = currentPlan?.tasks.filter(task => 
    filterPriority === 'All' || task.priority === filterPriority
  ) || [];

  const completedTasks = currentPlan?.tasks.filter(task => task.completed).length || 0;
  const totalTasks = currentPlan?.tasks.length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (!currentPlan) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>No plan found</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.buttonPrimary }]}
          onPress={() => navigation.navigate('CreatePlan')}
        >
          <Text style={[styles.createButtonText, { color: theme.colors.buttonText }]}>Create New Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.planTitle, { color: theme.colors.text }]}>{currentPlan.title}</Text>
          <Text style={[styles.planDescription, { color: theme.colors.textSecondary }]}>{currentPlan.description}</Text>
          <Text style={[styles.timeHorizon, { color: theme.colors.textSecondary }]}>Time Horizon: {currentPlan.timeHorizon}</Text>
        </View>

        {/* Progress */}
        <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {completedTasks} of {totalTasks} tasks completed ({progressPercentage}%)
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%`, backgroundColor: theme.colors.primary }
              ]} 
            />
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={[styles.filterContainer, { backgroundColor: theme.colors.card }]}>
          {(['All', 'High', 'Medium', 'Low'] as const).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.filterButton,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                filterPriority === priority && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setFilterPriority(priority)}
            >
              <Text style={[
                styles.filterText,
                { color: theme.colors.text },
                filterPriority === priority && { color: theme.colors.buttonText }
              ]}>
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks */}
        <View style={[styles.tasksContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.tasksTitle, { color: theme.colors.text }]}>Tasks</Text>
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item, index) => item.id || index.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tasksList}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.buttonPrimary }]}
            onPress={() => navigation.navigate('CreatePlan')}
          >
            <Text style={[styles.editButtonText, { color: theme.colors.buttonText }]}>Create New Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.colors.error }]}
            onPress={handleClearPlan}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.buttonText }]}>Clear Plan</Text>
          </TouchableOpacity>
        </View>

        {/* View History Button */}
        <TouchableOpacity
          style={[styles.historyButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={[styles.historyButtonText, { color: theme.colors.text }]}>📋 View All Plans</Text>
        </TouchableOpacity>

        {/* Completion Message */}
        {completedTasks === totalTasks && totalTasks > 0 && (
          <View style={[styles.completionContainer, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={[styles.completionTitle, { color: theme.colors.buttonText }]}>Congratulations!</Text>
            <Text style={[styles.completionText, { color: theme.colors.buttonText }]}>
              You've completed all tasks in your plan!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 8,
  },
  timeHorizon: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonSelected: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextSelected: {
    color: '#ffffff',
  },
  tasksContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tasksList: {
    paddingTop: 8,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  taskItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    marginRight: 12,
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  taskEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskDetails: {
    marginLeft: 28,
    marginTop: 8,
  },
  dueDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  taskNotes: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  completionContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  historyButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
});