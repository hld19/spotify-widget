/**
 * Podcast Controls Component
 * Enhanced controls for podcast playback
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { 
  PlayIcon, 
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  BookmarkIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

interface PodcastControlsProps {
  isPlaying: boolean;
  currentProgress: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (position: number) => void;
  onSpeedChange?: (speed: number) => void;
  episodeName?: string;
  showName?: string;
  chapterName?: string;
}

export default function PodcastControls({
  isPlaying,
  currentProgress,
  duration,
  onPlay,
  onPause,
  onSeek,
  onSpeedChange,
  episodeName = '',
  showName = '',
  chapterName = ''
}: PodcastControlsProps) {
  const { currentTheme } = useTheme();
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  useEffect(() => {
    const savedSpeed = localStorage.getItem('podcastPlaybackSpeed');
    if (savedSpeed) {
      setPlaybackSpeed(parseFloat(savedSpeed));
    }

    const savedBookmarks = localStorage.getItem(`bookmarks_${episodeName}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, [episodeName]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    localStorage.setItem('podcastPlaybackSpeed', speed.toString());
    onSpeedChange?.(speed);
    setShowSpeedMenu(false);
  };

  const skipForward = () => {
    const newPosition = Math.min(currentProgress + 30000, duration);  
    onSeek(newPosition);
  };

  const skipBackward = () => {
    const newPosition = Math.max(currentProgress - 15000, 0); 
    onSeek(newPosition);
  };

  const addBookmark = () => {
    const newBookmarks = [...bookmarks, currentProgress].sort((a, b) => a - b);
    setBookmarks(newBookmarks);
    localStorage.setItem(`bookmarks_${episodeName}`, JSON.stringify(newBookmarks));
  };

  const jumpToBookmark = (position: number) => {
    onSeek(position);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Episode Info */}
      <div className="text-center">
        <h3 className="font-semibold text-lg" style={{ color: currentTheme.text }}>
          {episodeName}
        </h3>
        <p className="text-sm" style={{ color: currentTheme.textSecondary }}>
          {showName}
        </p>
        {chapterName && (
          <p className="text-xs mt-1" style={{ color: currentTheme.textMuted }}>
            Chapter: {chapterName}
          </p>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4">
        {/* Skip Back 15s */}
        <button
          onClick={skipBackward}
          className="relative p-2 rounded-lg transition-all hover:scale-110"
          style={{ color: currentTheme.textSecondary }}
        >
          <BackwardIcon className="w-6 h-6" />
          <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs">
            15s
          </span>
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-4 rounded-full transition-all hover:scale-110"
          style={{
            backgroundColor: currentTheme.primary,
            color: '#ffffff',
          }}
        >
          {isPlaying ? (
            <PauseIcon className="w-8 h-8" />
          ) : (
            <PlayIcon className="w-8 h-8" />
          )}
        </button>

        {/* Skip Forward 30s */}
        <button
          onClick={skipForward}
          className="relative p-2 rounded-lg transition-all hover:scale-110"
          style={{ color: currentTheme.textSecondary }}
        >
          <ForwardIcon className="w-6 h-6" />
          <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs">
            30s
          </span>
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Speed */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentTheme.backgroundSecondary,
              color: currentTheme.text,
            }}
          >
            {playbackSpeed}x
          </button>
          
          {showSpeedMenu && (
            <div 
              className="absolute bottom-full left-0 mb-2 p-2 rounded-lg shadow-lg"
              style={{
                backgroundColor: currentTheme.backgroundSecondary,
                border: `1px solid ${currentTheme.border}`,
              }}
            >
              {speeds.map(speed => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`block w-full px-3 py-1 text-sm text-left rounded transition-colors ${
                    speed === playbackSpeed ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: speed === playbackSpeed 
                      ? currentTheme.primary + '20' 
                      : 'transparent',
                    color: speed === playbackSpeed 
                      ? currentTheme.primary 
                      : currentTheme.text,
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add Bookmark */}
        <button
          onClick={addBookmark}
          className="p-2 rounded-lg transition-colors"
          style={{ color: currentTheme.textSecondary }}
          title="Add bookmark"
        >
          <BookmarkIcon className="w-5 h-5" />
        </button>

        {/* Sleep Timer Integration */}
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: currentTheme.textSecondary }}
          title="Sleep timer"
        >
          <ClockIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.textSecondary }}>
            Bookmarks
          </p>
          <div className="flex flex-wrap gap-2">
            {bookmarks.map((bookmark, index) => (
              <button
                key={index}
                onClick={() => jumpToBookmark(bookmark)}
                className="px-2 py-1 text-xs rounded transition-colors"
                style={{
                  backgroundColor: currentTheme.backgroundSecondary,
                  color: currentTheme.text,
                }}
              >
                {formatTime(bookmark)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Button */}
      <button
        className="w-full py-2 text-sm rounded-lg transition-colors"
        style={{
          backgroundColor: currentTheme.backgroundSecondary,
          color: currentTheme.text,
        }}
      >
        View Transcript
      </button>
    </div>
  );
} 
