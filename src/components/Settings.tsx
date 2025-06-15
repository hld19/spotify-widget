import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/spotify';
import { ThemeContext } from '../App';

const Settings = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    return null; // or a loading state
  }

  const { theme, setTheme } = themeContext;

  const handleLogout = () => {
    logout();
    navigate('/');
    // Force a reload to clear all state
    window.location.reload();
  };

  const getButtonClass = (buttonTheme: 'light' | 'dark' | 'system') => {
    const base = 'px-4 py-2 rounded-lg transition-colors text-sm';
    if (theme === buttonTheme) {
      return `${base} bg-neutral-800 dark:bg-white text-white dark:text-black`;
    }
    return `${base} bg-neutral-200 dark:bg-white/20 hover:bg-neutral-300 dark:hover:bg-white/30 text-neutral-800 dark:text-white`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-black/30 backdrop-blur-2xl rounded-lg p-4 text-neutral-900 dark:text-white transition-colors">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-center">Theme</h2>
        <div className="flex space-x-2">
          <button onClick={() => setTheme('light')} className={getButtonClass('light')}>Light</button>
          <button onClick={() => setTheme('dark')} className={getButtonClass('dark')}>Dark</button>
          <button onClick={() => setTheme('system')} className={getButtonClass('system')}>System</button>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Logout
      </button>
      <button
        onClick={() => navigate('/')}
        className="mt-4 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
      >
        Back to Player
      </button>
    </div>
  );
};

export default Settings; 