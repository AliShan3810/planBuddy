import React, { createContext, useContext, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  card: string;
  shadow: string;
  inputBackground: string;
  inputBorder: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonText: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: '#007AFF',
    secondary: '#5856D6',
    text: '#000000',
    textSecondary: '#6C757D',
    border: '#E9ECEF',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    card: '#FFFFFF',
    shadow: '#00000020',
    inputBackground: '#FFFFFF',
    inputBorder: '#CED4DA',
    buttonPrimary: '#007AFF',
    buttonSecondary: '#6C757D',
    buttonText: '#FFFFFF',
    tabBar: '#FFFFFF',
    tabBarActive: '#007AFF',
    tabBarInactive: '#8E8E93',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
    card: '#1C1C1E',
    shadow: '#00000040',
    inputBackground: '#1C1C1E',
    inputBorder: '#38383A',
    buttonPrimary: '#0A84FF',
    buttonSecondary: '#48484A',
    buttonText: '#FFFFFF',
    tabBar: '#1C1C1E',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#8E8E93',
  },
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const getCurrentTheme = (): Theme => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = getCurrentTheme();

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
