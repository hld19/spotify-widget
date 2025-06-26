/**
 * Widget Position Component
 * Allows users to position the widget with presets or custom positions
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { LogicalPosition } from '@tauri-apps/api/window';

interface WidgetPositionProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface PresetPosition {
  name: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'top-center' | 'bottom-center';
  icon: string;
}

const presets: PresetPosition[] = [
  { name: 'Top Left', position: 'top-left', icon: '↖️' },
  { name: 'Top Center', position: 'top-center', icon: '⬆️' },
  { name: 'Top Right', position: 'top-right', icon: '↗️' },
  { name: 'Center', position: 'center', icon: '⭕' },
  { name: 'Bottom Left', position: 'bottom-left', icon: '↙️' },
  { name: 'Bottom Center', position: 'bottom-center', icon: '⬇️' },
  { name: 'Bottom Right', position: 'bottom-right', icon: '↘️' },
];

export default function WidgetPosition({ isOpen, onClose }: WidgetPositionProps) {
  const { currentTheme } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState<string>('top-right');
  const [customPosition, setCustomPosition] = useState<Position>({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const savedPosition = localStorage.getItem('widgetPosition');
    if (savedPosition) {
      const pos = JSON.parse(savedPosition);
      if (pos.preset) {
        setSelectedPreset(pos.preset);
      } else if (pos.custom) {
        setCustomPosition(pos.custom);
      }
    }

    const getWindowSize = async () => {
      try {
        const appWindow = await WebviewWindow.getCurrent();
        const size = await appWindow.innerSize();
        setWindowSize({ width: size.width, height: size.height });
      } catch (error) {
        console.error('Failed to get window size:', error);
      }
    };

    getWindowSize();
  }, []);

  if (!isOpen) return null;

  const calculatePosition = (preset: string): Position => {
    const margin = 20;
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;

    switch (preset) {
      case 'top-left':
        return { x: margin, y: margin };
      case 'top-center':
        return { x: (screenWidth - windowSize.width) / 2, y: margin };
      case 'top-right':
        return { x: screenWidth - windowSize.width - margin, y: margin };
      case 'center':
        return {
          x: (screenWidth - windowSize.width) / 2,
          y: (screenHeight - windowSize.height) / 2,
        };
      case 'bottom-left':
        return { x: margin, y: screenHeight - windowSize.height - margin - 40 }; // 40 for taskbar
      case 'bottom-center':
        return {
          x: (screenWidth - windowSize.width) / 2,
          y: screenHeight - windowSize.height - margin - 40,
        };
      case 'bottom-right':
        return {
          x: screenWidth - windowSize.width - margin,
          y: screenHeight - windowSize.height - margin - 40,
        };
      default:
        return { x: 100, y: 100 };
    }
  };

  const applyPosition = async (position: Position) => {
    try {
      const appWindow = await WebviewWindow.getCurrent();
      await appWindow.setPosition(new LogicalPosition(position.x, position.y));
    } catch (error) {
      console.error('Failed to set window position:', error);
    }
  };

  const applyPreset = (preset: string) => {
    setSelectedPreset(preset);
    const position = calculatePosition(preset);
    applyPosition(position);
    
    localStorage.setItem('widgetPosition', JSON.stringify({ preset }));
  };

  const applyCustomPosition = () => {
    applyPosition(customPosition);
    setSelectedPreset('');
    
    localStorage.setItem('widgetPosition', JSON.stringify({ custom: customPosition }));
  };

  const startDragging = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const previewElement = e.currentTarget as HTMLElement;
    const rect = previewElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * window.screen.availWidth;
    const y = ((e.clientY - rect.top) / rect.height) * window.screen.availHeight;
    
    setCustomPosition({ x: Math.round(x), y: Math.round(y) });
    setSelectedPreset('');
  };

  const stopDragging = () => {
    if (isDragging) {
      setIsDragging(false);
      applyCustomPosition();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl p-6 max-w-2xl w-full"
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
          <h2 className="text-lg font-semibold">Widget Position</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: currentTheme.textMuted }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Positions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: currentTheme.textSecondary }}>
            Preset Positions
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.position}
                onClick={() => applyPreset(preset.position)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedPreset === preset.position ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: selectedPreset === preset.position 
                    ? currentTheme.primary + '20' 
                    : currentTheme.backgroundSecondary,
                  color: selectedPreset === preset.position 
                    ? currentTheme.primary 
                    : currentTheme.text,
                  borderColor: currentTheme.primary,
                }}
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <p className="text-xs font-medium">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Position */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: currentTheme.textSecondary }}>
            Custom Position
          </h3>
          
          {/* Visual Preview */}
          <div 
            className="relative h-48 rounded-lg mb-4 cursor-crosshair"
            style={{ backgroundColor: currentTheme.backgroundSecondary }}
            onMouseDown={startDragging}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            <div className="absolute inset-0 p-2">
              <div className="w-full h-full border-2 border-dashed rounded" 
                style={{ borderColor: currentTheme.border }}
              />
            </div>
            <div 
              className="absolute w-12 h-8 rounded flex items-center justify-center text-xs font-medium transition-all"
              style={{
                backgroundColor: currentTheme.primary,
                color: '#ffffff',
                left: `${(customPosition.x / window.screen.availWidth) * 100}%`,
                top: `${(customPosition.y / window.screen.availHeight) * 100}%`,
                transform: 'translate(-50%, -50%)',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            >
              Widget
            </div>
            <p className="absolute bottom-2 left-2 text-xs" style={{ color: currentTheme.textMuted }}>
              Click and drag to position
            </p>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs block mb-1" style={{ color: currentTheme.textSecondary }}>
                X Position
              </label>
              <input
                type="number"
                value={customPosition.x}
                onChange={(e) => {
                  setCustomPosition(prev => ({ ...prev, x: Number(e.target.value) }));
                  setSelectedPreset('');
                }}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: currentTheme.backgroundSecondary,
                  color: currentTheme.text,
                  border: `1px solid ${currentTheme.border}`,
                }}
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: currentTheme.textSecondary }}>
                Y Position
              </label>
              <input
                type="number"
                value={customPosition.y}
                onChange={(e) => {
                  setCustomPosition(prev => ({ ...prev, y: Number(e.target.value) }));
                  setSelectedPreset('');
                }}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: currentTheme.backgroundSecondary,
                  color: currentTheme.text,
                  border: `1px solid ${currentTheme.border}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: currentTheme.backgroundSecondary,
              color: currentTheme.text,
            }}
          >
            Close
          </button>
          {!selectedPreset && (
            <button
              onClick={applyCustomPosition}
              className="px-4 py-2 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: currentTheme.primary,
                color: '#ffffff',
              }}
            >
              Apply Custom Position
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
