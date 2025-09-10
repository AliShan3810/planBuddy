import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  onPress?: () => void;
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ onPress, style }) => {
  const { theme, themeMode, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    return themeMode === 'light' ? '🌞' : '🌙';
  };

  const handlePress = () => {
    toggleTheme();
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{getThemeIcon()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 20,
  },
});
