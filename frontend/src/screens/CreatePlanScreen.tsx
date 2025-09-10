import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { generatePlanFromGoal, clearError } from '../store/planSlice';
import { RootState } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

export default function CreatePlanScreen({ navigation }: any) {
  const [goal, setGoal] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<'Today' | 'This Week'>('Today');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.plan);
  const { theme } = useTheme();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {};

    if (field === 'goal') {
      if (!value.trim()) {
        errors['goal'] = 'Goal is required';
      } else if (value.trim().length < 3) {
        errors['goal'] = 'Goal must be at least 3 characters long';
      } else if (value.trim().length > 200) {
        errors['goal'] = 'Goal must be less than 200 characters';
      }
    }

    if (field === 'timeHorizon') {
      if (!value) {
        errors['timeHorizon'] = 'Time horizon is required';
      }
    }

    return errors;
  };

  const validateAllInputs = () => {
    const goalErrors = validateField('goal', goal);
    const timeHorizonErrors = validateField('timeHorizon', timeHorizon);
    
    const allErrors = { ...goalErrors, ...timeHorizonErrors };
    setValidationErrors(allErrors);
    
    return Object.keys(allErrors).length === 0;
  };

  const handleGeneratePlan = async () => {
    if (!validateAllInputs()) {
      return;
    }

    try {
      const result = await dispatch(generatePlanFromGoal({
        goal: goal.trim(),
        timeHorizon
      }) as any);
      
      // Check if the action was fulfilled
      if (result.type === 'plan/generatePlanFromGoal/fulfilled') {
        // Clear the form after successful plan generation
        setGoal('');
        setTimeHorizon('Today');
        setValidationErrors({});
        
        navigation.navigate('Plan');
      } else if (result.type === 'plan/generatePlanFromGoal/rejected') {
        Alert.alert('Error', 'Failed to generate plan. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Your Plan</Text>
          <ThemeToggle />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter your goal and we'll create a structured plan for you
        </Text>

        {/* Goal Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Goal</Text>
          <TextInput
            style={[
              styles.textInput,
              { 
                minHeight: 100, 
                textAlignVertical: 'top',
                backgroundColor: theme.colors.inputBackground,
                borderColor: validationErrors['goal'] ? theme.colors.error : theme.colors.inputBorder,
                color: theme.colors.text
              }
            ]}
            value={goal}
            onChangeText={(text) => {
              setGoal(text);
              // Clear validation error when user starts typing
              if (validationErrors['goal']) {
                setValidationErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors['goal'];
                  return newErrors;
                });
              }
            }}
            placeholder="e.g., Get ready to launch an ecommerce store"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
          />
          {validationErrors['goal'] && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{validationErrors['goal']}</Text>
          )}
        </View>

        {/* Time Horizon Picker */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Time Horizon</Text>
          <View style={[
            styles.pickerContainer,
            { 
              backgroundColor: theme.colors.surface,
              borderColor: validationErrors['timeHorizon'] ? theme.colors.error : theme.colors.border
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                { backgroundColor: theme.colors.surface },
                timeHorizon === 'Today' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => {
                setTimeHorizon('Today');
                // Clear validation error when user selects
                if (validationErrors['timeHorizon']) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors['timeHorizon'];
                    return newErrors;
                  });
                }
              }}
            >
              <Text style={[
                styles.pickerText,
                { color: theme.colors.text },
                timeHorizon === 'Today' && { color: theme.colors.buttonText }
              ]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                { backgroundColor: theme.colors.surface },
                timeHorizon === 'This Week' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => {
                setTimeHorizon('This Week');
                // Clear validation error when user selects
                if (validationErrors['timeHorizon']) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors['timeHorizon'];
                    return newErrors;
                  });
                }
              }}
            >
              <Text style={[
                styles.pickerText,
                { color: theme.colors.text },
                timeHorizon === 'This Week' && { color: theme.colors.buttonText }
              ]}>
                This Week
              </Text>
            </TouchableOpacity>
          </View>
          {validationErrors['timeHorizon'] && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{validationErrors['timeHorizon']}</Text>
          )}
        </View>

        {/* Generate Button */}
        <TouchableOpacity 
          style={[
            styles.generateButton, 
            { backgroundColor: theme.colors.buttonPrimary },
            isLoading && styles.generateButtonDisabled
          ]} 
          onPress={handleGeneratePlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.buttonText} />
              <Text style={[styles.generateButtonText, { color: theme.colors.buttonText }]}>Generating Plan...</Text>
            </View>
          ) : (
            <Text style={[styles.generateButtonText, { color: theme.colors.buttonText }]}>Generate Plan</Text>
          )}
        </TouchableOpacity>

        {/* View History Button */}
        <TouchableOpacity 
          style={[styles.historyButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={[styles.historyButtonText, { color: theme.colors.text }]}>📋 View Previous Plans</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'left',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'left',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
  },
  pickerContainerError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  pickerOption: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#6366f1',
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  pickerTextSelected: {
    color: '#ffffff',
  },
  generateButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  historyButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});