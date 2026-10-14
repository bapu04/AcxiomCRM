import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('acxiom_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
      if (body) {
        body.classList.add('dark');
        body.classList.remove('light');
      }
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
      }
    }

    try {
      localStorage.setItem('acxiom_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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

// Reusable ThemeToggle component with segmented Light & Dark controls
export const ThemeToggle = ({ className = '', compact = false }) => {
  const { theme, toggleTheme, setTheme } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={`Current: ${theme === 'dark' ? 'Dark' : 'Light'} Mode. Click to switch.`}
        aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        className={`p-2 rounded-xl transition duration-200 flex items-center justify-center border shadow-sm ${
          theme === 'dark'
            ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700 hover:text-amber-300'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-indigo-600'
        } ${className}`}
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-600 transition-transform hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl border transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-700/80 shadow-inner'
          : 'bg-slate-100 border-slate-300/80 shadow-inner'
      } ${className}`}
      role="group"
      aria-label="Theme selection"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white text-indigo-600 shadow border border-slate-200'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Activate Light Theme"
      >
        <Sun className={`h-3.5 w-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-slate-800 text-amber-300 shadow border border-slate-700'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="Activate Dark Theme"
      >
        <Moon className={`h-3.5 w-3.5 ${theme === 'dark' ? 'text-amber-400' : 'text-slate-400'}`} />
        <span>Dark</span>
      </button>
    </div>
  );
};

export default ThemeContext;
