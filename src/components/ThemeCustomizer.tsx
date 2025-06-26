/**
 * Theme Customizer Component
 * Advanced theme customization options
 */

import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { XMarkIcon, PaintBrushIcon } from '@heroicons/react/24/solid';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetThemes = [
  {
    name: 'Spotify Green',
    colors: {
      primary: '#1db954',
      secondary: '#1ed760',
      accent: '#21e065',
      background: '#121212',
      backgroundSecondary: '#181818',
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      textMuted: '#7a7a7a',
      border: '#282828',
      shadow: 'rgba(0, 0, 0, 0.7)'
    }
  },
  {
    name: 'Ocean Blue',
    colors: {
      primary: '#0077be',
      secondary: '#0099cc',
      accent: '#00bbff',
      background: '#001f3f',
      backgroundSecondary: '#002952',
      text: '#ffffff',
      textSecondary: '#a8c7d8',
      textMuted: '#6b8ca3',
      border: '#003366',
      shadow: 'rgba(0, 0, 0, 0.7)'
    }
  },
  {
    name: 'Sunset Orange',
    colors: {
      primary: '#ff6b35',
      secondary: '#ff8c42',
      accent: '#ffaa5a',
      background: '#1a0f0a',
      backgroundSecondary: '#2a1710',
      text: '#ffffff',
      textSecondary: '#ffcc99',
      textMuted: '#cc9966',
      border: '#3d1f14',
      shadow: 'rgba(0, 0, 0, 0.7)'
    }
  },
  {
    name: 'Purple Dream',
    colors: {
      primary: '#9b59b6',
      secondary: '#b77dc4',
      accent: '#d4a5d9',
      background: '#1a0f1a',
      backgroundSecondary: '#2a1a2e',
      text: '#ffffff',
      textSecondary: '#d9b3ff',
      textMuted: '#9966cc',
      border: '#3d2a47',
      shadow: 'rgba(0, 0, 0, 0.7)'
    }
  },
  {
    name: 'Midnight Dark',
    colors: {
      primary: '#4a5568',
      secondary: '#718096',
      accent: '#a0aec0',
      background: '#000000',
      backgroundSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      textMuted: '#666666',
      border: '#333333',
      shadow: 'rgba(0, 0, 0, 0.9)'
    }
  }
];

export default function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const { currentTheme, updateCustomTheme } = useTheme();
  const [customColors, setCustomColors] = useState(currentTheme);

  if (!isOpen) return null;

  const handleColorChange = (key: string, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyTheme = () => {
    updateCustomTheme(customColors);
    onClose();
  };

  const applyPreset = (preset: typeof presetThemes[0]) => {
    setCustomColors(preset.colors);
    updateCustomTheme(preset.colors);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: currentTheme.background,
          color: currentTheme.text,
          border: `1px solid ${currentTheme.border}`,
          boxShadow: `0 20px 40px ${currentTheme.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <PaintBrushIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h2 className="text-lg font-semibold">Theme Customizer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: currentTheme.textMuted }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Themes */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: currentTheme.textSecondary }}>
            Preset Themes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presetThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-3 rounded-lg text-left transition-all hover:scale-105"
                style={{
                  backgroundColor: preset.colors.backgroundSecondary,
                  border: `1px solid ${preset.colors.border}`,
                }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>
                </div>
                <p className="text-xs font-medium" style={{ color: preset.colors.text }}>
                  {preset.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: currentTheme.textSecondary }}>
            Custom Colors
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(customColors).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="text-xs capitalize" style={{ color: currentTheme.textSecondary }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                    style={{ backgroundColor: value }}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs rounded"
                    style={{
                      backgroundColor: currentTheme.backgroundSecondary,
                      color: currentTheme.text,
                      border: `1px solid ${currentTheme.border}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: currentTheme.backgroundSecondary,
              color: currentTheme.text,
            }}
          >
            Cancel
          </button>
          <button
            onClick={applyTheme}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: currentTheme.primary,
              color: '#ffffff',
            }}
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
} 