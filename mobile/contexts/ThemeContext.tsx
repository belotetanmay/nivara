import React, { createContext, useContext } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { Colors } from '../constants/theme';

type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly border: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly card: string;
  readonly error: string;
  readonly success: string;
  readonly warning: string;
}

interface ThemeContextType {
  colorScheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use react-native's useColorScheme directly — nativewind's is deprecated in v4+
  const systemScheme = useColorScheme();
  const currentScheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const isDark = currentScheme === 'dark';
  const colors = Colors[currentScheme];

  const handleSetColorScheme = (scheme: ColorScheme) => {
    Appearance.setColorScheme(scheme);
  };

  const handleToggle = () => {
    Appearance.setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: currentScheme,
        isDark,
        colors,
        setColorScheme: handleSetColorScheme,
        toggleColorScheme: handleToggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
