import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateTaskStatus, clearCurrentPlan } from '../store/planSlice';
import { RootState } from '../types';

export default function PlanScreen({ navigation }: any) {
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  
  const dispatch = useDispatch();
  const { currentPlan } = useSelector((state: RootState) => state.plan);

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
    if (currentPlan) {
      const updatedTasks = [...currentPlan.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        completed: !updatedTasks[taskIndex].completed
      };
      
      dispatch(updateTaskStatus({
        taskId: updatedTasks[taskIndex].id,
        completed: updatedTasks[taskIndex].completed
      }));
    }
  };

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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No plan found</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreatePlan')}
        >
          <Text style={styles.createButtonText}>Create New Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.planTitle}>{currentPlan.title}</Text>
          <Text style={styles.planDescription}>{currentPlan.description}</Text>
          <Text style={styles.timeHorizon}>Time Horizon: {currentPlan.timeHorizon}</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completedTasks} of {totalTasks} tasks completed ({progressPercentage}%)
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {(['All', 'High', 'Medium', 'Low'] as const).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.filterButton,
                filterPriority === priority && styles.filterButtonSelected
              ]}
              onPress={() => setFilterPriority(priority)}
            >
              <Text style={[
                styles.filterText,
                filterPriority === priority && styles.filterTextSelected
              ]}>
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks */}
        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>Tasks</Text>
          {filteredTasks.map((task, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.taskItem,
                task.completed && styles.taskItemCompleted
              ]}
              onPress={() => handleTaskToggle(index)}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  <Text style={styles.taskEmoji}>{task.emoji}</Text>
                  <Text style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted
                  ]}>
                    {task.title}
                  </Text>
                </View>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(task.priority) }
                ]}>
                  <Text style={styles.priorityText}>{task.priority}</Text>
                </View>
              </View>
              
              <View style={styles.taskDetails}>
                <Text style={styles.dueDate}>Due: {task.dueDate}</Text>
                {task.notes && (
                  <Text style={styles.taskNotes}>{task.notes}</Text>
                )}
              </View>
              
              <View style={[
                styles.checkbox,
                task.completed && styles.checkboxCompleted
              ]}>
                {task.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('CreatePlan')}
          >
            <Text style={styles.editButtonText}>Create New Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearPlan}
          >
            <Text style={styles.clearButtonText}>Clear Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Completion Message */}
        {completedTasks === totalTasks && totalTasks > 0 && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Congratulations!</Text>
            <Text style={styles.completionText}>
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
    position: 'relative',
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
    position: 'absolute',
    right: 0,
    top: 16,
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
});