/**
 * Lyrics Component
 * Display song lyrics with synced highlighting
 */

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { XMarkIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';

interface LyricsProps {
  isOpen: boolean;
  onClose: () => void;
  trackName: string;
  artistName: string;
  currentProgress: number;
  isPlaying: boolean;
}

interface LyricLine {
  time: number;
  text: string;
}
const placeholderLyrics: LyricLine[] = [
  { time: 0, text: "♪ Instrumental ♪" },
  { time: 5000, text: "Searching for lyrics..." },
  { time: 10000, text: "Lyrics feature coming soon!" },
  { time: 15000, text: "Connect your favorite lyrics provider" },
  { time: 20000, text: "To display synchronized lyrics here" },
  { time: 25000, text: "♪ ♪ ♪" },
];

export default function Lyrics({ isOpen, onClose, trackName, artistName, currentProgress, isPlaying }: LyricsProps) {
  const { currentTheme } = useTheme();
  const [lyrics] = useState<LyricLine[]>(placeholderLyrics);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const currentIndex = lyrics.findIndex((line, index) => {
      const nextLine = lyrics[index + 1];
      return currentProgress >= line.time && (!nextLine || currentProgress < nextLine.time);
    });
    
    if (currentIndex !== -1 && currentIndex !== currentLineIndex) {
      setCurrentLineIndex(currentIndex);
    }
  }, [currentProgress, lyrics, currentLineIndex]);

  useEffect(() => {
    if (currentLineIndex >= 0 && lineRefs.current[currentLineIndex] && lyricsContainerRef.current) {
      const currentLine = lineRefs.current[currentLineIndex];
      const container = lyricsContainerRef.current;
      
      if (currentLine) {
        const lineTop = currentLine.offsetTop;
        const lineHeight = currentLine.offsetHeight;
        const containerHeight = container.offsetHeight;
        const scrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);
        
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [currentLineIndex]);

  useEffect(() => {
    const loadLyrics = async () => {
      try {
      } catch (error) {
        console.error('Failed to load lyrics:', error);
      }
    };

    if (isOpen) {
      loadLyrics();
    }
  }, [isOpen, trackName, artistName]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl p-6 max-w-2xl w-full h-[80vh] flex flex-col"
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
          <div className="flex items-center space-x-2">
            <MusicalNoteIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <div>
              <h2 className="text-lg font-semibold">{trackName}</h2>
              <p className="text-sm" style={{ color: currentTheme.textSecondary }}>{artistName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: currentTheme.textMuted }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Lyrics Container */}
        <div 
          ref={lyricsContainerRef}
          className="flex-1 overflow-y-auto py-8 px-4 scroll-smooth"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div className="space-y-6 text-center">
            {lyrics.map((line, index) => (
              <div
                key={index}
                ref={el => lineRefs.current[index] = el}
                className={`transition-all duration-300 cursor-pointer ${
                  index === currentLineIndex 
                    ? 'text-2xl font-bold scale-105' 
                    : index < currentLineIndex 
                      ? 'text-lg opacity-40' 
                      : 'text-lg opacity-60'
                }`}
                style={{
                  color: index === currentLineIndex ? currentTheme.primary : currentTheme.text,
                  textShadow: index === currentLineIndex ? `0 0 20px ${currentTheme.primary}40` : 'none',
                }}
                onClick={() => {
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: currentTheme.border }}>
          <div className="flex items-center space-x-2">
            <div 
              className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: isPlaying ? currentTheme.primary : currentTheme.textMuted }}
            />
            <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
              {isPlaying ? 'Syncing...' : 'Paused'}
            </span>
          </div>
          
          <button
            onClick={() => {
              alert('Lyrics provider settings coming soon!');
            }}
            className="text-xs px-3 py-1 rounded-lg transition-colors"
            style={{
              backgroundColor: currentTheme.backgroundSecondary,
              color: currentTheme.textSecondary,
            }}
          >
            Configure Provider
          </button>
        </div>
      </div>
    </div>
  );
} 
