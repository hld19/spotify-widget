/**
 * �� Player Component - Dynamic Album-Based Theming
 * Beautiful, adaptive player that matches album artwork colors
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/solid';
import ProgressBar from './ProgressBar';
import { useSpotify } from '../hooks/useSpotify';
import { useTheme } from '../hooks/useTheme';
// Import API to ensure auth listener is set up
import '../api/spotify';

export default function Player() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    isReady, 
    isAuthenticated, 
    playerState, 
    currentProgress,
    error,
    login, 
    logout,
    controls,
    clearError 
  } = useSpotify();

  const {
    isDarkMode,
    currentTheme,
    updateTheme,
    isExtracting,
    cssVariables,
    toggleTheme
  } = useTheme();

  // Update theme when album artwork changes
  useEffect(() => {
    if (playerState?.item?.album?.images?.[0]?.url) {
      updateTheme(playerState.item.album.images[0].url);
    }
  }, [playerState?.item?.album?.images?.[0]?.url, updateTheme]);

  // Apply CSS variables to the document root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [cssVariables]);

  // Loading state
  if (!isReady) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center rounded-3xl text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
        }}
      >
        <div className="flex flex-col items-center space-y-4 z-10">
          <div className="relative">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{
                borderColor: `${currentTheme.primary}30`,
                borderTopColor: currentTheme.primary,
              }}
            ></div>
          </div>
          <span className="text-sm font-medium" style={{ color: currentTheme.textSecondary }}>
            Initializing...
          </span>
        </div>
        
        {/* Animated background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${currentTheme.primary} 0%, transparent 50%), 
                        radial-gradient(circle at 70% 80%, ${currentTheme.secondary} 0%, transparent 50%)`,
          }}
        />
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center rounded-3xl p-8 border shadow-2xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
          borderColor: currentTheme.border,
          boxShadow: `0 25px 50px -12px ${currentTheme.shadow}`,
        }}
      >
        <div className="text-center max-w-sm z-10">
          {/* Spotify Icon */}
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`,
            }}
          >
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          
          <h1 
            className="text-2xl font-bold mb-3 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${currentTheme.text} 0%, ${currentTheme.textSecondary} 100%)`,
            }}
          >
            Spotify Widget
          </h1>
          <p className="mb-6 leading-relaxed" style={{ color: currentTheme.textSecondary }}>
            Connect your Spotify account to control your music with this beautiful desktop widget
          </p>
          
          <button 
            onClick={login}
            className="group relative font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`,
              color: '#ffffff',
              boxShadow: `0 10px 25px -5px ${currentTheme.primary}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 20px 40px -10px ${currentTheme.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 10px 25px -5px ${currentTheme.primary}40`;
            }}
          >
            <span className="relative z-10">Connect Spotify</span>
          </button>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="mt-4 p-2 rounded-lg transition-colors duration-200"
            style={{
              color: currentTheme.textMuted,
              backgroundColor: `${currentTheme.backgroundSecondary}80`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = currentTheme.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = currentTheme.textMuted;
            }}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          
          {error && (
            <div 
              className="mt-4 p-3 border rounded-lg"
              style={{
                backgroundColor: `${currentTheme.accent}20`,
                borderColor: `${currentTheme.accent}30`,
                color: currentTheme.accent,
              }}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
        
        {/* Animated background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(circle at 20% 30%, ${currentTheme.primary} 0%, transparent 50%), 
                        radial-gradient(circle at 80% 70%, ${currentTheme.secondary} 0%, transparent 50%)`,
          }}
        />
      </div>
    );
  }

  // No music playing state
  if (!playerState || !playerState.item) {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center rounded-3xl p-8 border shadow-2xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
          borderColor: currentTheme.border,
          boxShadow: `0 25px 50px -12px ${currentTheme.shadow}`,
        }}
      >
        <div className="text-center z-10">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
            style={{ backgroundColor: currentTheme.backgroundSecondary }}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" style={{ color: currentTheme.textMuted }}>
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: currentTheme.text }}>Nothing Playing</h2>
          <p className="mb-4" style={{ color: currentTheme.textMuted }}>Open Spotify and start playing your favorite music!</p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link 
              to="/settings"
              className="p-2 rounded-lg transition-colors"
              style={{ color: currentTheme.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = currentTheme.text;
                e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = currentTheme.textMuted;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: currentTheme.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = currentTheme.text;
                e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = currentTheme.textMuted;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={logout}
              className="text-sm transition-colors"
              style={{ color: currentTheme.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = currentTheme.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = currentTheme.textMuted;
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
        
        {/* Subtle animated background */}
        <div 
          className="absolute inset-0 opacity-3"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${currentTheme.primary} 0%, transparent 60%)`,
          }}
        />
      </div>
    );
  }

  const { item, is_playing } = playerState;
  const albumArt = item.album.images[0]?.url || '';
  const trackName = item.name;
  const artistName = item.artists.map(a => a.name).join(', ');

  return (
    <div 
      data-tauri-drag-region 
      className="w-full h-full rounded-3xl font-sans overflow-hidden border shadow-2xl relative"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
        color: currentTheme.text,
        borderColor: currentTheme.border,
        boxShadow: `0 25px 50px -12px ${currentTheme.shadow}`,
      }}
    >
      {/* Color extraction indicator */}
      {isExtracting && (
        <div className="absolute top-2 right-2 z-50">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentTheme.primary }}
          />
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div 
          className="absolute top-2 left-2 right-2 z-50 text-xs p-2 rounded-lg flex items-center space-x-2 animate-in slide-in-from-top"
          style={{
            backgroundColor: `${currentTheme.accent}90`,
            color: '#ffffff',
          }}
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span className="flex-1">{error}</span>
          <button 
            onClick={clearError} 
            className="text-white/80 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Dynamic background gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${currentTheme.primary} 0%, transparent 50%), 
                      radial-gradient(circle at 80% 80%, ${currentTheme.secondary} 0%, transparent 50%)`,
        }}
      />

      <div className={`flex p-6 transition-all duration-500 ease-out relative z-10 ${isExpanded ? 'flex-col items-center' : 'flex-row items-center h-full'}`}>
        
        {/* Album Art */}
        <div className={`flex-shrink-0 transition-all duration-500 ${isExpanded ? 'mb-6' : 'mr-6'}`}>
          <div className="relative group">
            <img
              src={albumArt}
              alt="Album Art"
              className={`aspect-square object-cover rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-105 ${
                isExpanded ? 'w-48 h-48' : 'w-20 h-20'
              }`}
              style={{
                boxShadow: `0 20px 40px -10px ${currentTheme.primary}30`,
              }}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
              }}
            />
            {/* Play overlay on album art when paused */}
            {!is_playing && (
              <div 
                className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: `${currentTheme.background}60` }}
              >
                <button
                  onClick={() => controls.play()}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                  style={{ backgroundColor: `${currentTheme.primary}20` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${currentTheme.primary}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${currentTheme.primary}20`;
                  }}
                >
                  <PlayIcon className="w-8 h-8 text-white ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex flex-col flex-grow transition-all duration-500 ${isExpanded ? 'w-full text-center' : 'min-w-0'}`}>
          
          {/* Track Info & Controls Header */}
          <div className={`flex ${isExpanded ? 'flex-col items-center' : 'flex-row items-center justify-between'} mb-4`}>
            <div className={`${isExpanded ? 'mb-4' : 'flex-grow min-w-0 mr-4'}`}>
              <h2 
                className={`font-bold transition-all duration-500 truncate ${isExpanded ? 'text-2xl mb-2' : 'text-lg'}`}
                style={{ color: currentTheme.text }}
              >
                {trackName}
              </h2>
              <p 
                className={`transition-all duration-500 truncate ${isExpanded ? 'text-lg' : 'text-sm'}`}
                style={{ color: currentTheme.textSecondary }}
              >
                {artistName}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: currentTheme.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = currentTheme.text;
                  e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = currentTheme.textMuted;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors"
                style={{ color: currentTheme.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = currentTheme.text;
                  e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = currentTheme.textMuted;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <Link 
                to="/settings"
                className="p-2 rounded-lg transition-colors"
                style={{ color: currentTheme.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = currentTheme.text;
                  e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = currentTheme.textMuted;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Playback Controls */}
          <div className={`flex items-center ${isExpanded ? 'justify-center space-x-8 mb-6' : 'justify-center space-x-4 mb-4'}`}>
            <button 
              onClick={controls.previous}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: currentTheme.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = currentTheme.text;
                e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}80`;
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = currentTheme.textSecondary;
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Previous track"
            >
              <BackwardIcon className={`${isExpanded ? 'w-6 h-6' : 'w-5 h-5'}`} />
            </button>
            
            <button 
              onClick={() => is_playing ? controls.pause() : controls.play()}
              className="group relative rounded-full p-3 shadow-lg transition-all duration-200 transform"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100())`,
                color: '#ffffff',
                boxShadow: `0 10px 25px -5px ${currentTheme.primary}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = `0 20px 40px -10px ${currentTheme.primary}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 10px 25px -5px ${currentTheme.primary}40`;
              }}
              title={is_playing ? 'Pause' : 'Play'}
            >
              {is_playing ? 
                <PauseIcon className={`${isExpanded ? 'w-7 h-7' : 'w-6 h-6'}`} /> : 
                <PlayIcon className={`${isExpanded ? 'w-7 h-7' : 'w-6 h-6'} ml-0.5`} />
              }
            </button>
            
            <button 
              onClick={controls.next}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: currentTheme.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = currentTheme.text;
                e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}80`;
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = currentTheme.textSecondary;
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Next track"
            >
              <ForwardIcon className={`${isExpanded ? 'w-6 h-6' : 'w-5 h-5'}`} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <ProgressBar
              currentProgress={currentProgress}
              duration={item.duration_ms}
              isPlaying={is_playing}
              onSeek={controls.seek}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 