import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('water-quality-theme');
    return savedTheme || 'light';
  });

  const [themeConfig, setThemeConfig] = useState({
    light: {
      background: '#f8fafc',
      surface: '#ffffff',
      primary: '#10b981',
      secondary: '#3b82f6',
      danger: '#ef4444',
      warning: '#f59e0b',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      cardBg: '#ffffff'
    },
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#10b981',
      secondary: '#60a5fa',
      danger: '#f87171',
      warning: '#fbbf24',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      cardBg: '#1e293b'
    },
    ocean: {
      background: '#0c4a6e',
      surface: '#1e3a8a',
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      danger: '#ef4444',
      warning: '#f59e0b',
      text: '#e0f2fe',
      textSecondary: '#bae6fd',
      border: '#1e40af',
      cardBg: '#1e3a8a'
    }
  });

  useEffect(() => {
    localStorage.setItem('water-quality-theme', theme);
    const colors = themeConfig[theme];
    
    // Apply CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, themeConfig]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};