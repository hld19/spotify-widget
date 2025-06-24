/**
 * Settings Component - Enhanced settings page
 * Comprehensive settings with better organization
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  SunIcon, 
  MoonIcon, 
  PowerIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  KeyIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { logout } from '../api/spotify';
import { useSpotify } from '../hooks/useSpotify';
import ThemeCustomizer from './ThemeCustomizer';

export default function Settings() {
  const {
    isDarkMode,
    currentTheme,
    cssVariables,
    toggleTheme
  } = useTheme();

  const [autoStart, setAutoStart] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('compactMode') === 'true';
  });
  const [alwaysOnTop, setAlwaysOnTop] = useState(true);
  const [showInTaskbar, setShowInTaskbar] = useState(false);
  const [pollingInterval, setPollingInterval] = useState('1');
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [cssVariables]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleCompactModeToggle = () => {
    const newValue = !compactMode;
    setCompactMode(newValue);
    localStorage.setItem('compactMode', newValue.toString());
    window.location.reload();
  };

  const SettingRow = ({ icon: Icon, title, description, children, onClick }: any) => (
    <div
      className="flex items-center justify-between p-2 rounded-lg border transition-all hover:border-opacity-60 cursor-pointer"
      style={{
        backgroundColor: currentTheme.backgroundSecondary + '20',
        borderColor: currentTheme.border + '40',
      }}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2 min-w-0">
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: currentTheme.primary }} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-xs leading-tight">{title}</p>
          {description && (
            <p className="text-[10px] leading-tight opacity-75" style={{ color: currentTheme.textMuted }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
      {children}
      </div>
    </div>
  );

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="relative inline-flex h-4 w-7 items-center rounded-full transition-colors"
      style={{
        backgroundColor: active ? currentTheme.primary : currentTheme.backgroundSecondary,
      }}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          active ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  return (
    <div 
      data-tauri-drag-region
      className="w-full h-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
        color: currentTheme.text,
        minWidth: '320px', // Minimum width for readability
        maxWidth: '100%'   // Allow horizontal shrinking
      }}
    >
      {/* Header - More compact */}
      <div 
        className="flex items-center justify-between px-2 py-2 border-b"
        style={{ borderColor: currentTheme.border }}
      >
        <div className="flex items-center space-x-1">
          <Link
            to="/"
            className="p-1 rounded-lg transition-colors hover:bg-opacity-10"
            style={{ 
              color: currentTheme.textSecondary,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeftIcon className="w-3 h-3" />
          </Link>
          <h1 className="text-sm font-semibold" style={{ color: currentTheme.text }}>
            Settings
          </h1>
        </div>
        
        <div className="flex items-center space-x-1 text-[10px]" style={{ color: currentTheme.textMuted }}>
          <SparklesIcon className="w-2 h-2" />
          <span>v2.1</span>
        </div>
      </div>

      {/* Content - Fixed scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-2 space-y-3" style={{ minHeight: 'fit-content' }}>
          
          {/* Appearance Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Appearance
            </h2>
            
            <SettingRow
              icon={isDarkMode ? MoonIcon : SunIcon}
              title={isDarkMode ? 'Dark Mode' : 'Light Mode'}
              description="Switch between light and dark theme"
              onClick={toggleTheme}
            >
              <Toggle active={isDarkMode} onClick={toggleTheme} />
            </SettingRow>

            <SettingRow
              icon={CogIcon}
              title="Compact Mode"
              description="Reduce UI element sizes"
              onClick={handleCompactModeToggle}
            >
              <Toggle active={compactMode} onClick={handleCompactModeToggle} />
            </SettingRow>

            <div
              onClick={() => setShowThemeCustomizer(true)}
              className="flex items-center justify-between p-3 rounded-lg border transition-all hover:border-opacity-60 cursor-pointer"
              style={{
                backgroundColor: currentTheme.backgroundSecondary + '20',
                borderColor: currentTheme.border + '40',
              }}
            >
              <div className="flex items-center space-x-3">
                <SparklesIcon className="w-5 h-5 flex-shrink-0" style={{ color: currentTheme.primary }} />
                <div className="min-w-0">
                  <p className="font-medium text-sm">Customize Theme</p>
                  <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                    Choose colors and presets
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentTheme.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentTheme.secondary }}
                />
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentTheme.accent }}
                />
              </div>
            </div>
          </section>

          {/* Window Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Window
            </h2>
            
            <SettingRow
              icon={ComputerDesktopIcon}
              title="Always on Top"
              description="Keep widget above other windows"
              onClick={() => setAlwaysOnTop(!alwaysOnTop)}
            >
              <Toggle active={alwaysOnTop} onClick={() => setAlwaysOnTop(!alwaysOnTop)} />
            </SettingRow>

            <SettingRow
              icon={ComputerDesktopIcon}
              title="Show in Taskbar"
              description="Display widget in system taskbar"
              onClick={() => setShowInTaskbar(!showInTaskbar)}
            >
              <Toggle active={showInTaskbar} onClick={() => setShowInTaskbar(!showInTaskbar)} />
            </SettingRow>
          </section>

          {/* Behavior Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Behavior
            </h2>
            
            <SettingRow
              icon={PowerIcon}
              title="Start with System"
              description="Launch widget on startup"
              onClick={() => setAutoStart(!autoStart)}
            >
              <Toggle active={autoStart} onClick={() => setAutoStart(!autoStart)} />
            </SettingRow>

            <SettingRow
              icon={BellIcon}
              title="Track Notifications"
              description="Show notification when track changes"
              onClick={() => setNotifications(!notifications)}
            >
              <Toggle active={notifications} onClick={() => setNotifications(!notifications)} />
            </SettingRow>

            <SettingRow
              icon={ClockIcon}
              title="Update Interval"
              description="How often to sync with Spotify"
            >
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(e.target.value)}
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: currentTheme.backgroundSecondary,
                  color: currentTheme.text,
                  border: `1px solid ${currentTheme.border}`,
                }}
              >
                <option value="0.5">0.5s</option>
                <option value="1">1s</option>
                <option value="2">2s</option>
                <option value="3">3s</option>
              </select>
            </SettingRow>
          </section>

          {/* Privacy & Security Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Privacy & Security
            </h2>
            
            <div
              className="p-3 rounded-lg border space-y-2"
              style={{
                backgroundColor: currentTheme.backgroundSecondary + '20',
                borderColor: currentTheme.border + '40',
              }}
            >
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <p className="text-sm font-medium">Session Security</p>
              </div>
              <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                Your Spotify credentials are stored locally and encrypted. Sessions expire after 30 days for security.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <KeyIcon className="w-3 h-3" style={{ color: currentTheme.textSecondary }} />
                <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
                  OAuth 2.0 PKCE Flow
                </span>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              About
            </h2>
            
            <div 
              className="rounded-lg p-3 border"
              style={{
                backgroundColor: currentTheme.backgroundSecondary + '20',
                borderColor: currentTheme.border + '40',
              }}
            >
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.textMuted }}>Version</span>
                  <span className="font-medium">2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.textMuted }}>Build</span>
                  <span className="font-medium">Stable</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.textMuted }}>Framework</span>
                  <span className="font-medium">Tauri 2.0 + React 18</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.textMuted }}>License</span>
                  <span className="font-medium">MIT</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t" style={{ borderColor: currentTheme.border + '40' }}>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 text-xs transition-colors"
                  style={{ color: currentTheme.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <ArrowPathIcon className="w-3 h-3" />
                  <span>Refresh App</span>
                </button>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="space-y-2 pb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Account
            </h2>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg transition-all font-medium text-sm"
              style={{
                backgroundColor: currentTheme.accent + '20',
                color: currentTheme.accent,
                border: `1px solid ${currentTheme.accent}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = currentTheme.accent + '30';
                e.currentTarget.style.borderColor = currentTheme.accent + '60';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = currentTheme.accent + '20';
                e.currentTarget.style.borderColor = currentTheme.accent + '40';
              }}
            >
              <PowerIcon className="w-4 h-4" />
              <span>Disconnect Spotify</span>
            </button>
          </section>

        </div>
      </div>

      {/* Theme Customizer Modal */}
      <ThemeCustomizer 
        isOpen={showThemeCustomizer} 
        onClose={() => setShowThemeCustomizer(false)} 
      />
    </div>
  );
} 