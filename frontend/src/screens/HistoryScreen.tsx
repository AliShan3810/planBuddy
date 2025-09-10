import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../types';
import { setCurrentPlan, deletePlan } from '../store/planSlice';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

export default function HistoryScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { plans } = useSelector((state: RootState) => state.plan);
  const { theme } = useTheme();

  const handleViewPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      // Set as current plan and navigate to Plan screen
      dispatch(setCurrentPlan(plan));
      navigation.navigate('Plan');
    }
  };

  const handleDeletePlan = (planId: string, planTitle: string) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${planTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deletePlan(planId));
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = (plan: any) => {
    if (plan.totalTasks === 0) return 0;
    return Math.round((plan.completedTasks / plan.totalTasks) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (plans.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Plans Yet</Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Create your first plan to get started with achieving your goals!
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.buttonPrimary }]}
          onPress={() => navigation.navigate('CreatePlan')}
        >
          <Text style={[styles.createButtonText, { color: theme.colors.buttonText }]}>Create Your First Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Your Plans</Text>
          <ThemeToggle />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {plans.length} plan{plans.length !== 1 ? 's' : ''} created
        </Text>

        {plans.map((plan) => (
          <View key={plan.id} style={[styles.planCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <Text style={[styles.planTitle, { color: theme.colors.text }]}>{plan.title}</Text>
                <Text style={[styles.planDate, { color: theme.colors.textSecondary }]}>{formatDate(plan.createdAt)}</Text>
                <Text style={[styles.planTimeHorizon, { color: theme.colors.textSecondary }]}>
                  Time Horizon: {plan.timeHorizon}
                </Text>
              </View>
              <View style={styles.planActions}>
                <TouchableOpacity
                  style={[styles.viewButton, { backgroundColor: theme.colors.buttonPrimary }]}
                  onPress={() => handleViewPlan(plan.id)}
                >
                  <Text style={[styles.viewButtonText, { color: theme.colors.buttonText }]}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => handleDeletePlan(plan.id, plan.title)}
                >
                  <Text style={[styles.deleteButtonText, { color: theme.colors.buttonText }]}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.planStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>{plan.totalTasks}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tasks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>{plan.completedTasks}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>{getProgressPercentage(plan)}%</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Progress</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getProgressPercentage(plan)}%`, backgroundColor: theme.colors.primary }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.tasksPreview}>
              <Text style={[styles.tasksPreviewTitle, { color: theme.colors.text }]}>Tasks Preview:</Text>
              {plan.tasks.slice(0, 3).map((task, index) => (
                <View key={index} style={styles.taskPreviewItem}>
                  <Text style={styles.taskEmoji}>{task.emoji}</Text>
                  <Text style={[
                    styles.taskPreviewText,
                    { color: theme.colors.text },
                    task.completed && { textDecorationLine: 'line-through', color: theme.colors.textSecondary }
                  ]}>
                    {task.title}
                  </Text>
                  <View style={[
                    styles.priorityDot,
                    { backgroundColor: getPriorityColor(task.priority) }
                  ]} />
                </View>
              ))}
              {plan.tasks.length > 3 && (
                <Text style={[styles.moreTasks, { color: theme.colors.textSecondary }]}>
                  +{plan.tasks.length - 3} more tasks
                </Text>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.createNewButton, { backgroundColor: theme.colors.buttonPrimary }]}
          onPress={() => navigation.navigate('CreatePlan')}
        >
          <Text style={[styles.createNewButtonText, { color: theme.colors.buttonText }]}>+ Create New Plan</Text>
        </TouchableOpacity>
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
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  planTimeHorizon: {
    fontSize: 14,
    color: '#9ca3af',
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  tasksPreview: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  tasksPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  taskPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  taskPreviewText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  taskPreviewTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  moreTasks: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 4,
  },
  createNewButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createNewButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
