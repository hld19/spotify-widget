import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/spotify';
import { ThemeContext } from '../App';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

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
    const base = 'px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium hover:scale-105';
    if (theme === buttonTheme) {
      return `${base} bg-green-500 text-white shadow-lg`;
    }
    return `${base} bg-neutral-200/80 dark:bg-neutral-700/80 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white`;
  };

  return (
    <div 
      data-tauri-drag-region 
      className="w-full h-full flex flex-col bg-white/90 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 text-neutral-900 dark:text-white transition-all duration-300 shadow-xl border border-white/20 dark:border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-2 -m-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>
      
      {/* Content */}
      <div className="flex-grow flex flex-col justify-center space-y-8">
        {/* Theme Section */}
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Appearance</h2>
          <div className="flex justify-center space-x-3">
            <button onClick={() => setTheme('light')} className={getButtonClass('light')}>
              ☀️ Light
            </button>
            <button onClick={() => setTheme('dark')} className={getButtonClass('dark')}>
              🌙 Dark
            </button>
            <button onClick={() => setTheme('system')} className={getButtonClass('system')}>
              💻 System
            </button>
          </div>
        </div>
        
        {/* Logout Section */}
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Account</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🚪 Disconnect Spotify
          </button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            This will log you out and clear all stored data
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t border-neutral-200/50 dark:border-neutral-700/50">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Spotify Widget v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Settings; 