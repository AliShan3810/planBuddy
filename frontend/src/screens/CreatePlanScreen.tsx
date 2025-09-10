import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { generatePlanFromGoal, clearError } from '../store/planSlice';
import { RootState } from '../types';

export default function CreatePlanScreen({ navigation }: any) {
  const [goal, setGoal] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<'Today' | 'This Week'>('Today');
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.plan);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleGeneratePlan = async () => {
    if (!goal.trim()) {
      Alert.alert('Error', 'Please enter a goal');
      return;
    }

    try {
      await dispatch(generatePlanFromGoal({
        goal: goal.trim(),
        timeHorizon
      })).unwrap();
      navigation.navigate('Plan');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Plan</Text>
        <Text style={styles.subtitle}>
          Enter your goal and we'll create a structured plan for you
        </Text>

        {/* Goal Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal</Text>
          <TextInput
            style={styles.textInput}
            value={goal}
            onChangeText={setGoal}
            placeholder="e.g., Get ready to launch an ecommerce store"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Time Horizon Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time Horizon</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                timeHorizon === 'Today' && styles.pickerOptionSelected
              ]}
              onPress={() => setTimeHorizon('Today')}
            >
              <Text style={[
                styles.pickerText,
                timeHorizon === 'Today' && styles.pickerTextSelected
              ]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                timeHorizon === 'This Week' && styles.pickerOptionSelected
              ]}
              onPress={() => setTimeHorizon('This Week')}
            >
              <Text style={[
                styles.pickerText,
                timeHorizon === 'This Week' && styles.pickerTextSelected
              ]}>
                This Week
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity 
          style={[styles.generateButton, isLoading && styles.generateButtonDisabled]} 
          onPress={handleGeneratePlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.generateButtonText}>Generating Plan...</Text>
            </View>
          ) : (
            <Text style={styles.generateButtonText}>Generate Plan</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
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
});