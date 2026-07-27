import { useTheme } from '../ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="toggle-track">
        <Sun className="toggle-icon sun-icon" size={14} />
        <Moon className="toggle-icon moon-icon" size={14} />
        <div className={`toggle-thumb ${theme}`} />
      </div>
    </button>
  );
}
