/**
 * 🎵 Settings Component - Dynamic Theme Edition  
 * Beautiful settings interface with album-based theming
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  SunIcon, 
  MoonIcon, 
  PowerIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  PaintBrushIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { logout } from '../api/spotify';

export default function Settings() {
  const {
    isDarkMode,
    currentTheme,
    cssVariables,
    toggleTheme,
    isExtracting
  } = useTheme();

  // Apply CSS variables to the document root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [cssVariables]);

  const handleLogout = () => {
    logout();
    // Navigate back to main view
    window.location.href = '/';
  };

  return (
    <div 
      className="w-full h-full rounded-3xl overflow-hidden border shadow-2xl relative"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
        color: currentTheme.text,
        borderColor: currentTheme.border,
        boxShadow: `0 25px 50px -12px ${currentTheme.shadow}`,
      }}
    >
      {/* Dynamic background gradient */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${currentTheme.primary} 0%, transparent 60%), 
                      radial-gradient(circle at 70% 70%, ${currentTheme.secondary} 0%, transparent 60%)`,
        }}
      />

      {/* Header */}
      <div 
        className="flex items-center justify-between p-6 border-b relative z-10"
        style={{ borderColor: currentTheme.border }}
      >
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="p-2 transition-colors rounded-lg"
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
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: currentTheme.text }}>
            Settings
          </h1>
        </div>

        {/* Theme extraction indicator */}
        {isExtracting && (
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-4 h-4 animate-pulse" style={{ color: currentTheme.primary }} />
            <span className="text-xs" style={{ color: currentTheme.textMuted }}>
              Extracting colors...
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 relative z-10">
        
        {/* Theme Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <PaintBrushIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h2 className="text-lg font-semibold" style={{ color: currentTheme.text }}>
              Appearance
            </h2>
          </div>
          
          <div className="space-y-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border"
              style={{
                backgroundColor: `${currentTheme.backgroundSecondary}60`,
                borderColor: `${currentTheme.border}80`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}80`;
                e.currentTarget.style.borderColor = currentTheme.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}60`;
                e.currentTarget.style.borderColor = `${currentTheme.border}80`;
              }}
            >
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <MoonIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
                ) : (
                  <SunIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
                )}
                <span className="font-medium" style={{ color: currentTheme.text }}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm" style={{ color: currentTheme.textMuted }}>
                  Tap to switch
                </span>
                <ChevronRightIcon className="w-4 h-4" style={{ color: currentTheme.textMuted }} />
              </div>
            </button>

            {/* Color Info */}
            <div 
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: `${currentTheme.backgroundSecondary}40`,
                borderColor: `${currentTheme.border}60`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: currentTheme.textSecondary }}>
                  Dynamic Colors
                </span>
                <div className="flex space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ 
                      backgroundColor: currentTheme.primary,
                      borderColor: currentTheme.border,
                    }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ 
                      backgroundColor: currentTheme.secondary,
                      borderColor: currentTheme.border,
                    }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ 
                      backgroundColor: currentTheme.accent,
                      borderColor: currentTheme.border,
                    }}
                  />
                </div>
              </div>
              <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                Colors automatically adapt to your current album artwork
              </p>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: currentTheme.text }}>
            About
          </h2>
          <div 
            className="rounded-xl p-4 space-y-3 border"
            style={{
              backgroundColor: `${currentTheme.backgroundSecondary}40`,
              borderColor: `${currentTheme.border}60`,
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ color: currentTheme.textMuted }}>Version</span>
              <span style={{ color: currentTheme.text }}>2.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentTheme.textMuted }}>Built with</span>
              <span style={{ color: currentTheme.text }}>Tauri & React</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentTheme.textMuted }}>API</span>
              <span style={{ color: currentTheme.text }}>Spotify Web API</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: currentTheme.textMuted }}>Theme Engine</span>
              <span style={{ color: currentTheme.text }}>Dynamic Colors</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: currentTheme.text }}>
            Account
          </h2>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border"
            style={{
              backgroundColor: `${currentTheme.accent}10`,
              borderColor: `${currentTheme.accent}30`,
              color: currentTheme.accent,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.accent}20`;
              e.currentTarget.style.borderColor = `${currentTheme.accent}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.accent}10`;
              e.currentTarget.style.borderColor = `${currentTheme.accent}30`;
            }}
          >
            <div className="flex items-center space-x-3">
              <PowerIcon className="w-5 h-5" />
              <span className="font-medium">Disconnect Spotify</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div 
          className="pt-4 border-t"
          style={{ borderColor: currentTheme.border }}
        >
          <p className="text-center text-sm" style={{ color: currentTheme.textMuted }}>
            Made with ❤️ for music lovers
          </p>
        </div>
      </div>
    </div>
  );
} 