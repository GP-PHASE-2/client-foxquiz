import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <button onClick={toggleTheme} className="theme-toggle-btn">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
};

export default ThemeToggle;

