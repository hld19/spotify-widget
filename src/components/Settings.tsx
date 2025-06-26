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
  ArrowPathIcon,
  ViewColumnsIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { logout } from '../api/spotify';
import { useSpotify } from '../hooks/useSpotify';
import { useSleepTimer } from '../hooks/useSleepTimer';
import ThemeCustomizer from './ThemeCustomizer';
import AudioSettings from './AudioSettings';

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
  const [miniMode, setMiniMode] = useState(() => {
    return localStorage.getItem('miniMode') === 'true';
  });
  const [transparentMode, setTransparentMode] = useState(() => {
    return localStorage.getItem('transparentMode') === 'true';
  });
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [localMusicPath, setLocalMusicPath] = useState(() => {
    return localStorage.getItem('localMusicPath') || '';
  });
  const { controls } = useSpotify();
  
  const sleepTimer = useSleepTimer({
    onTimerEnd: () => {
      controls.pause();
    }
  });

  
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [cssVariables]);

  useEffect(() => {
    const savedAutoStart = localStorage.getItem('autoStart');
    const savedNotifications = localStorage.getItem('notifications');
    const savedAlwaysOnTop = localStorage.getItem('alwaysOnTop');
    const savedShowInTaskbar = localStorage.getItem('showInTaskbar');
    const savedPollingInterval = localStorage.getItem('pollingInterval');

    if (savedAutoStart !== null) setAutoStart(savedAutoStart === 'true');
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
    if (savedAlwaysOnTop !== null) setAlwaysOnTop(savedAlwaysOnTop === 'true');
    if (savedShowInTaskbar !== null) setShowInTaskbar(savedShowInTaskbar === 'true');
    if (savedPollingInterval !== null) setPollingInterval(savedPollingInterval);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };



  return (
    <div 
      className="w-full h-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
        color: currentTheme.text,
        minWidth: '320px', 
        maxWidth: '100%'   
      }}
    >
      {/* Header - More compact */}
      <div 
        data-tauri-drag-region
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
          <span>v3 :3</span>
        </div>
      </div>

      {/* Content - Fixed scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100% - 60px)' }}>
        <div className="p-2 space-y-3 pb-6">
          
          {/* Appearance Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Appearance
            </h2>
            
            {/* Simple working toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                {isDarkMode ? <MoonIcon className="w-4 h-4" style={{ color: currentTheme.primary }} /> : <SunIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />}
                <div>
                  <p className="font-medium text-sm">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Theme toggle clicked, current isDarkMode:', isDarkMode);
                  toggleTheme();
                  console.log('Theme toggle called');
                }}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: isDarkMode ? currentTheme.primary : currentTheme.backgroundSecondary,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Compact Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                <CogIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Compact Mode</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Reduce UI element sizes
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Compact mode toggle clicked, current:', compactMode);
                  const newValue = !compactMode;
                  setCompactMode(newValue);
                  localStorage.setItem('compactMode', newValue.toString());
                  console.log('Compact mode set to:', newValue);
                  window.location.reload();
                }}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: compactMode ? currentTheme.primary : currentTheme.backgroundSecondary,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    compactMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

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

          {/* View Modes Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              View Modes
            </h2>
            
            {/* Mini Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                <ViewColumnsIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Mini Mode</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Compact overlay layout
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Mini mode toggle clicked, current:', miniMode);
                  const newValue = !miniMode;
                  setMiniMode(newValue);
                  localStorage.setItem('miniMode', newValue.toString());
                  console.log('Mini mode set to:', newValue);
                }}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: miniMode ? currentTheme.primary : currentTheme.backgroundSecondary,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    miniMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Transparent Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                <EyeIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Transparent Mode</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Semi-transparent overlay style
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Transparent mode toggle clicked, current:', transparentMode);
                  const newValue = !transparentMode;
                  setTransparentMode(newValue);
                  localStorage.setItem('transparentMode', newValue.toString());
                  console.log('Transparent mode set to:', newValue);
                }}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: transparentMode ? currentTheme.primary : currentTheme.backgroundSecondary,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    transparentMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Sleep Timer Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Sleep Timer
            </h2>
            
            {sleepTimer.isActive ? (
              <div 
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: currentTheme.backgroundSecondary + '20',
                  borderColor: currentTheme.border + '40',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                    <div>
                      <p className="text-sm font-medium">Timer Active</p>
                      <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                        {sleepTimer.formattedTime} remaining
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={sleepTimer.stopTimer}
                    className="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: currentTheme.accent,
                      color: '#ffffff'
                    }}
                  >
                    Stop
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45, 60, 90, 120].map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => sleepTimer.startTimer(minutes)}
                    className="p-2 rounded-lg border text-xs font-medium transition-colors hover:bg-opacity-10"
                    style={{
                      borderColor: currentTheme.border,
                      color: currentTheme.text
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = currentTheme.primary + '20';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Audio Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Audio
            </h2>
            
            {/* Audio Settings Button */}
            <button
              onClick={() => setShowAudioSettings(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg border transition-all hover:border-opacity-60"
              style={{
                backgroundColor: currentTheme.backgroundSecondary + '20',
                borderColor: currentTheme.border + '40',
              }}
            >
              <div className="flex items-center space-x-3">
                <AdjustmentsHorizontalIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Audio Settings</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Equalizer & sound effects
                  </p>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentTheme.primary + '40' }} />
            </button>
          </section>

          {/* Local Files Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Local Files
            </h2>
            
            {/* Music Directory Path */}
            <div className="p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-start space-x-3 mb-2">
                <ComputerDesktopIcon className="w-4 h-4 mt-0.5" style={{ color: currentTheme.primary }} />
                <div className="flex-1">
                  <p className="font-medium text-sm">Music Directory</p>
                  <p className="text-xs opacity-75 mb-2" style={{ color: currentTheme.textMuted }}>
                    Path to your local music files for album art extraction
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={localMusicPath}
                      onChange={(e) => setLocalMusicPath(e.target.value)}
                      placeholder="e.g., C:\Users\YourName\Music"
                      className="flex-1 px-2 py-1 text-xs rounded border"
                      style={{
                        backgroundColor: currentTheme.background,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                      }}
                    />
                    <button
                      onClick={() => {
                        alert('Please manually enter your music directory path in the text field.\n\nCommon paths:\nWindows: C:\\Users\\YourName\\Music\nmacOS: /Users/YourName/Music\nLinux: /home/YourName/Music');
                      }}
                      className="px-3 py-1 text-xs rounded transition-colors"
                      style={{
                        backgroundColor: currentTheme.primary,
                        color: '#ffffff'
                      }}
                    >
                      Help
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem('localMusicPath', localMusicPath);
                        localStorage.removeItem('localAlbumArtCache');
                        window.location.reload();
                      }}
                      className="px-3 py-1 text-xs rounded transition-colors"
                      style={{
                        backgroundColor: currentTheme.secondary,
                        color: '#ffffff'
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
              
              {localMusicPath && (
                <div className="mt-2 p-2 rounded text-xs" style={{
                  backgroundColor: currentTheme.primary + '20',
                  color: currentTheme.text
                }}>
                  ✓ Path set: {localMusicPath}
                </div>
              )}
            </div>
          </section>

          {/* Window Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Window
            </h2>
            
            {/* Always on Top Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                <ComputerDesktopIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Always on Top</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Keep widget above other windows
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const newValue = !alwaysOnTop;
                  setAlwaysOnTop(newValue);
                  localStorage.setItem('alwaysOnTop', newValue.toString());
                }}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: alwaysOnTop ? currentTheme.primary : currentTheme.backgroundSecondary,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    alwaysOnTop ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Show in Taskbar Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                <ComputerDesktopIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Show in Taskbar</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Display widget in system taskbar
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const newValue = !showInTaskbar;
                  setShowInTaskbar(newValue);
                  localStorage.setItem('showInTaskbar', newValue.toString());
                }}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: showInTaskbar ? currentTheme.primary : currentTheme.backgroundSecondary,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    showInTaskbar ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Behavior Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: currentTheme.textSecondary }}>
              Behavior
            </h2>
            
            {/* Start with System Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                <PowerIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Start with System</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Launch widget on startup
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const newValue = !autoStart;
                  setAutoStart(newValue);
                  localStorage.setItem('autoStart', newValue.toString());
                }}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: autoStart ? currentTheme.primary : currentTheme.backgroundSecondary,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    autoStart ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Track Notifications Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                <BellIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Track Notifications</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    Show notification when track changes
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const newValue = !notifications;
                  setNotifications(newValue);
                  localStorage.setItem('notifications', newValue.toString());
                }}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{
                  backgroundColor: notifications ? currentTheme.primary : currentTheme.backgroundSecondary,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    notifications ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Update Interval */}
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{
              backgroundColor: currentTheme.backgroundSecondary + '20',
              borderColor: currentTheme.border + '40',
            }}>
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-4 h-4" style={{ color: currentTheme.primary }} />
                <div>
                  <p className="font-medium text-sm">Update Interval</p>
                  <p className="text-xs opacity-75" style={{ color: currentTheme.textMuted }}>
                    How often to sync with Spotify
                  </p>
                </div>
              </div>
              <select
                value={pollingInterval}
                onChange={(e) => {
                  setPollingInterval(e.target.value);
                  localStorage.setItem('pollingInterval', e.target.value);
                }}
                className="text-xs px-2 py-1 rounded cursor-pointer"
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
            </div>
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

      {/* Audio Settings Modal */}
      <AudioSettings 
        isOpen={showAudioSettings} 
        onClose={() => setShowAudioSettings(false)} 
      />
    </div>
  );
} 
