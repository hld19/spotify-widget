/**
 * Audio Settings Component
 * Advanced audio controls including crossfade, normalization, and quality settings
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import Equalizer from './Equalizer';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioSettings({ isOpen, onClose }: AudioSettingsProps) {
  const { currentTheme } = useTheme();
  const [crossfadeDuration, setCrossfadeDuration] = useState(5);
  const [normalizationEnabled, setNormalizationEnabled] = useState(true);
  const [normalizationLevel, setNormalizationLevel] = useState(-3);
  const [gaplessPlayback, setGaplessPlayback] = useState(true);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [audioQuality, setAudioQuality] = useState('high');
  const [showEqualizer, setShowEqualizer] = useState(false);

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('audioSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCrossfadeDuration(settings.crossfadeDuration || 5);
      setNormalizationEnabled(settings.normalizationEnabled ?? true);
      setNormalizationLevel(settings.normalizationLevel || -3);
      setGaplessPlayback(settings.gaplessPlayback ?? true);
      setAutoplayEnabled(settings.autoplayEnabled ?? true);
      setAudioQuality(settings.audioQuality || 'high');
    }
  }, []);

  if (!isOpen) return null;

  const saveSettings = () => {
    const settings = {
      crossfadeDuration,
      normalizationEnabled,
      normalizationLevel,
      gaplessPlayback,
      autoplayEnabled,
      audioQuality,
    };
    localStorage.setItem('audioSettings', JSON.stringify(settings));
    onClose();
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{
        backgroundColor: checked ? currentTheme.primary : currentTheme.backgroundSecondary,
      }}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <div 
          className="rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
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
              <AdjustmentsHorizontalIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
              <h2 className="text-lg font-semibold">Audio Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors"
              style={{ color: currentTheme.textMuted }}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Crossfade */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Crossfade</label>
                <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
                  {crossfadeDuration}s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={crossfadeDuration}
                onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: currentTheme.primary }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: currentTheme.textMuted }}>Off</span>
                <span className="text-xs" style={{ color: currentTheme.textMuted }}>12s</span>
              </div>
            </div>

            {/* Audio Normalization */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium">Audio Normalization</p>
                  <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                    Set the same volume level for all tracks
                  </p>
                </div>
                <ToggleSwitch checked={normalizationEnabled} onChange={setNormalizationEnabled} />
              </div>
              {normalizationEnabled && (
                <div className="ml-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
                      Volume Level
                    </span>
                    <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
                      {normalizationLevel} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="0"
                    value={normalizationLevel}
                    onChange={(e) => setNormalizationLevel(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: currentTheme.primary }}
                  />
                </div>
              )}
            </div>

            {/* Gapless Playback */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Gapless Playback</p>
                <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                  Eliminate silence between tracks
                </p>
              </div>
              <ToggleSwitch checked={gaplessPlayback} onChange={setGaplessPlayback} />
            </div>

            {/* Autoplay */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Autoplay</p>
                <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                  Play similar songs when your music ends
                </p>
              </div>
              <ToggleSwitch checked={autoplayEnabled} onChange={setAutoplayEnabled} />
            </div>

            {/* Audio Quality */}
            <div>
              <label className="text-sm font-medium block mb-2">Audio Quality</label>
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: currentTheme.backgroundSecondary,
                  color: currentTheme.text,
                  borderColor: currentTheme.border,
                }}
              >
                <option value="low">Low (24 kbit/s)</option>
                <option value="normal">Normal (96 kbit/s)</option>
                <option value="high">High (160 kbit/s)</option>
                <option value="very_high">Very High (320 kbit/s)</option>
              </select>
            </div>

            {/* Equalizer Button */}
            <button
              onClick={() => setShowEqualizer(true)}
              className="w-full py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              style={{
                backgroundColor: currentTheme.backgroundSecondary,
                color: currentTheme.text,
              }}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Open Equalizer</span>
            </button>
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
              onClick={saveSettings}
              className="px-4 py-2 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: currentTheme.primary,
                color: '#ffffff',
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Equalizer Modal */}
      <Equalizer isOpen={showEqualizer} onClose={() => setShowEqualizer(false)} />
    </>
  );
} 