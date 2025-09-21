import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type TextSize = 'small' | 'medium' | 'large';
export type FontType = 'default' | 'dyslexic';
export type ContrastMode = 'normal' | 'high';

interface ThemeContextType {
  theme: Theme;
  textSize: TextSize;
  fontType: FontType;
  contrastMode: ContrastMode;
  toggleTheme: () => void;
  setTextSize: (size: TextSize) => void;
  setFontType: (font: FontType) => void;
  setContrastMode: (mode: ContrastMode) => void;
  resetToDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [fontType, setFontType] = useState<FontType>('default');
  const [contrastMode, setContrastMode] = useState<ContrastMode>('normal');

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('soul-theme') as Theme;
    const savedTextSize = localStorage.getItem('soul-text-size') as TextSize;
    const savedFontType = localStorage.getItem('soul-font-type') as FontType;
    const savedContrastMode = localStorage.getItem('soul-contrast-mode') as ContrastMode;

    if (savedTheme) setTheme(savedTheme);
    if (savedTextSize) setTextSize(savedTextSize);
    if (savedFontType) setFontType(savedFontType);
    if (savedContrastMode) setContrastMode(savedContrastMode);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('soul-theme', theme);
  }, [theme]);

  // Apply text size to document
  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize);
    localStorage.setItem('soul-text-size', textSize);
  }, [textSize]);

  // Apply font type to document
  useEffect(() => {
    document.documentElement.setAttribute('data-font-type', fontType);
    localStorage.setItem('soul-font-type', fontType);
  }, [fontType]);

  // Apply contrast mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-contrast-mode', contrastMode);
    localStorage.setItem('soul-contrast-mode', contrastMode);
  }, [contrastMode]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const resetToDefaults = () => {
    setTheme('light');
    setTextSize('medium');
    setFontType('default');
    setContrastMode('normal');
  };

  const value: ThemeContextType = {
    theme,
    textSize,
    fontType,
    contrastMode,
    toggleTheme,
    setTextSize,
    setFontType,
    setContrastMode,
    resetToDefaults,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 