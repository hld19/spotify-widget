/**
 * Equalizer Component
 * Audio equalizer settings
 */

import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { XMarkIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';

interface EqualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EqualizerBand {
  frequency: string;
  gain: number;
}

const presets = {
  flat: { name: 'Flat', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  rock: { name: 'Rock', bands: [5, 4, 3, 1, -1, -1, 1, 3, 4, 5] },
  pop: { name: 'Pop', bands: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2] },
  jazz: { name: 'Jazz', bands: [4, 3, 1, 2, -2, -2, 0, 1, 3, 4] },
  classical: { name: 'Classical', bands: [5, 4, 3, 2, -2, -2, 2, 3, 4, 5] },
  dance: { name: 'Dance', bands: [6, 5, 2, 0, 0, -3, -5, -5, 0, 3] },
  bass: { name: 'Bass Boost', bands: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0] },
  treble: { name: 'Treble Boost', bands: [0, 0, 0, 0, 0, 1, 3, 5, 6, 7] },
  vocal: { name: 'Vocal', bands: [-3, -2, 0, 3, 5, 5, 3, 0, -2, -3] },
  custom: { name: 'Custom', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
};

const frequencies = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

export default function Equalizer({ isOpen, onClose }: EqualizerProps) {
  const { currentTheme } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState('flat');
  const [bands, setBands] = useState(presets.flat.bands);
  const [preamp, setPreamp] = useState(0);

  if (!isOpen) return null;

  const handleBandChange = (index: number, value: number) => {
    const newBands = [...bands];
    newBands[index] = value;
    setBands(newBands);
    setSelectedPreset('custom');
  };

  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setBands(presets[presetKey as keyof typeof presets].bands);
  };

  const resetEqualizer = () => {
    setSelectedPreset('flat');
    setBands(presets.flat.bands);
    setPreamp(0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl p-6 max-w-3xl w-full"
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
            <MusicalNoteIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h2 className="text-lg font-semibold">Equalizer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: currentTheme.textMuted }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: currentTheme.textSecondary }}>
            Presets
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-3 py-2 text-xs rounded-lg transition-all ${
                  selectedPreset === key ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: selectedPreset === key 
                    ? currentTheme.primary + '20' 
                    : currentTheme.backgroundSecondary,
                  color: selectedPreset === key 
                    ? currentTheme.primary 
                    : currentTheme.text,
                  borderColor: selectedPreset === key ? currentTheme.primary : 'transparent',
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Equalizer Bands */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: currentTheme.textSecondary }}>
              Frequency Bands
            </h3>
            <span className="text-xs" style={{ color: currentTheme.textMuted }}>
              -12 dB to +12 dB
            </span>
          </div>
          
          <div className="flex space-x-4">
            {/* Preamp */}
            <div className="flex flex-col items-center">
              <div 
                className="h-40 w-12 rounded-lg relative"
                style={{ backgroundColor: currentTheme.backgroundSecondary }}
              >
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={preamp}
                  onChange={(e) => setPreamp(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical' as any }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 rounded-lg transition-all"
                  style={{
                    backgroundColor: currentTheme.primary,
                    height: `${((preamp + 12) / 24) * 100}%`,
                  }}
                />
                <div className="absolute inset-x-0 top-1/2 h-px" 
                  style={{ backgroundColor: currentTheme.border }} 
                />
              </div>
              <span className="text-xs mt-2" style={{ color: currentTheme.textSecondary }}>
                Pre
              </span>
              <span className="text-xs" style={{ color: currentTheme.textMuted }}>
                {preamp > 0 ? '+' : ''}{preamp}
              </span>
            </div>

            <div className="w-px" style={{ backgroundColor: currentTheme.border }} />

            {/* Frequency Bands */}
            {bands.map((gain, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="h-40 w-8 rounded-lg relative"
                  style={{ backgroundColor: currentTheme.backgroundSecondary }}
                >
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={gain}
                    onChange={(e) => handleBandChange(index, Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical' as any }}
                  />
                  <div 
                    className="absolute bottom-0 left-0 right-0 rounded-lg transition-all"
                    style={{
                      backgroundColor: currentTheme.primary,
                      height: `${((gain + 12) / 24) * 100}%`,
                    }}
                  />
                  <div className="absolute inset-x-0 top-1/2 h-px" 
                    style={{ backgroundColor: currentTheme.border }} 
                  />
                </div>
                <span className="text-xs mt-2" style={{ color: currentTheme.textSecondary }}>
                  {frequencies[index]}
                </span>
                <span className="text-xs" style={{ color: currentTheme.textMuted }}>
                  {gain > 0 ? '+' : ''}{gain}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={resetEqualizer}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: currentTheme.backgroundSecondary,
              color: currentTheme.text,
            }}
          >
            Reset
          </button>
          <div className="flex space-x-3">
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
              onClick={() => {
                // Save equalizer settings
                localStorage.setItem('equalizer', JSON.stringify({ preset: selectedPreset, bands, preamp }));
                onClose();
              }}
              className="px-4 py-2 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: currentTheme.primary,
                color: '#ffffff',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 