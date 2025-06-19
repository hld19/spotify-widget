/**
 * Keyboard Shortcuts Modal
 * Displays all available keyboard shortcuts
 */

import { XMarkIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../hooks/useTheme';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: ['Space'], description: 'Play / Pause' },
  { keys: ['Ctrl', '→'], description: 'Next Track' },
  { keys: ['Ctrl', '←'], description: 'Previous Track' },
  { keys: ['Ctrl', '↑'], description: 'Volume Up' },
  { keys: ['Ctrl', '↓'], description: 'Volume Down' },
  { keys: ['Ctrl', 'S'], description: 'Toggle Shuffle' },
  { keys: ['Ctrl', 'R'], description: 'Toggle Repeat' },
  { keys: ['Ctrl', 'M'], description: 'Mini Mode' },
  { keys: ['Ctrl', 'H'], description: 'Hide/Show Tabs' },
  { keys: ['Ctrl', 'L'], description: 'Like Current Track' },
  { keys: ['Ctrl', 'Q'], description: 'Add to Queue' },
  { keys: ['Ctrl', '/'], description: 'Search' },
  { keys: ['Esc'], description: 'Close Modals' },
];

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const { currentTheme } = useTheme();

  if (!isOpen) return null;

  return (
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: currentTheme.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = currentTheme.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = currentTheme.textMuted;
            }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div 
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{ backgroundColor: currentTheme.backgroundSecondary + '20' }}
            >
              <span className="text-sm" style={{ color: currentTheme.textSecondary }}>
                {shortcut.description}
              </span>
              <div className="flex items-center space-x-1">
                {shortcut.keys.map((key, idx) => (
                  <span key={idx} className="flex items-center">
                    <kbd 
                      className="px-2 py-1 text-xs font-mono rounded"
                      style={{
                        backgroundColor: currentTheme.backgroundSecondary,
                        color: currentTheme.text,
                        border: `1px solid ${currentTheme.border}`,
                      }}
                    >
                      {key}
                    </kbd>
                    {idx < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-xs" style={{ color: currentTheme.textMuted }}>+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: currentTheme.border }}>
          <p className="text-xs text-center" style={{ color: currentTheme.textMuted }}>
            Press ? anytime to show shortcuts
          </p>
        </div>
      </div>
    </div>
  );
} 