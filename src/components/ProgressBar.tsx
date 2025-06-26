/**
 * 🎛️ ProgressBar Component - Dynamic Theme Edition
 * Ultra-smooth progress tracking with album-based colors
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ProgressBarProps {
  currentProgress: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (positionMs: number) => void;
  className?: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function ProgressBar({
  currentProgress,
  duration,
  isPlaying,
  onSeek,
  className = '',
}: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();

  const displayProgress = isDragging ? dragProgress : currentProgress;
  const progressPercent = duration > 0 ? (displayProgress / duration) * 100 : 0;
  const getProgressFromEvent = useCallback((event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!progressBarRef.current) return 0;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    return (percent / 100) * duration;
  }, [duration]);
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    
    const newProgress = getProgressFromEvent(event);
    setDragProgress(newProgress);
  }, [getProgressFromEvent]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const newProgress = getProgressFromEvent(event);
    setDragProgress(newProgress);
  }, [isDragging, getProgressFromEvent]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const finalProgress = getProgressFromEvent(event);
    setIsDragging(false);
    onSeek(Math.round(finalProgress));
  }, [isDragging, getProgressFromEvent, onSeek]);
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    
    const newProgress = getProgressFromEvent(event);
    onSeek(Math.round(newProgress));
  }, [isDragging, getProgressFromEvent, onSeek]);
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current Time */}
      <div 
        className="text-xs font-mono min-w-[35px] text-right"
        style={{ color: currentTheme.textMuted }}
      >
        {formatTime(displayProgress)}
      </div>
      
      {/* Progress Bar Container */}
      <div
        ref={progressBarRef}
        className={`
          flex-1 cursor-pointer relative transition-all duration-150 ease-out
          ${isHovering || isDragging ? 'h-2' : 'h-1.5'}
        `}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)', // Darker background for better contrast
          borderRadius: '9999px',
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties}
      >
        {/* Progress Fill - Made White */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-150 pointer-events-none"
          style={{ 
            width: `${Math.max(0, Math.min(100, progressPercent))}%`,
            background: isDragging 
              ? '#ffffff'
              : isPlaying 
                ? '#ffffff'
                : 'rgba(255, 255, 255, 0.6)',
          }}
        />
        
        {/* Drag Handle */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg pointer-events-none
            transition-all duration-150 ease-out
            ${isHovering || isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
          style={{ 
            left: `${Math.max(0, Math.min(100, progressPercent))}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#ffffff',
            boxShadow: `0 2px 8px ${currentTheme.shadow}, 0 0 0 2px ${currentTheme.primary}`,
          }}
        />
      </div>
      
      {/* Duration */}
      <div 
        className="text-xs font-mono min-w-[35px]"
        style={{ color: currentTheme.textMuted }}
      >
        {formatTime(duration)}
      </div>
    </div>
  );
} 
