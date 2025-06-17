/**
 * 🎛️ ProgressBar Component - Dynamic Theme Edition
 * Ultra-smooth progress tracking with album-based colors
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

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

  // Use drag progress when dragging, otherwise use real-time progress
  const displayProgress = isDragging ? dragProgress : currentProgress;
  const progressPercent = duration > 0 ? (displayProgress / duration) * 100 : 0;

  // Calculate position from mouse/touch event
  const getProgressFromEvent = useCallback((event: MouseEvent | TouchEvent) => {
    if (!progressBarRef.current) return 0;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    return (percent / 100) * duration;
  }, [duration]);

  // Mouse handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    
    const newProgress = getProgressFromEvent(event.nativeEvent);
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
    
    // Seek to the final position
    onSeek(Math.round(finalProgress));
  }, [isDragging, getProgressFromEvent, onSeek]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
    
    const newProgress = getProgressFromEvent(event.nativeEvent);
    setDragProgress(newProgress);
  }, [getProgressFromEvent]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isDragging) return;
    event.preventDefault();
    
    const newProgress = getProgressFromEvent(event);
    setDragProgress(newProgress);
  }, [isDragging, getProgressFromEvent]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isDragging) return;
    event.preventDefault();
    
    const finalProgress = getProgressFromEvent(event);
    setIsDragging(false);
    
    // Seek to the final position
    onSeek(Math.round(finalProgress));
  }, [isDragging, getProgressFromEvent, onSeek]);

  // Click to seek (when not dragging)
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (isDragging) return;
    
    const newProgress = getProgressFromEvent(event.nativeEvent);
    onSeek(Math.round(newProgress));
  }, [isDragging, getProgressFromEvent, onSeek]);

  // Global mouse/touch event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Current Time */}
      <div 
        className="text-xs font-mono min-w-[40px] text-right"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {formatTime(displayProgress)}
      </div>
      
      {/* Progress Bar Container */}
      <div
        ref={progressBarRef}
        className={`
          flex-1 cursor-pointer relative transition-all duration-150 ease-out
          ${isHovering || isDragging ? 'h-3' : 'h-2'}
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: '9999px',
        }}
      >
        {/* Background Track */}
        <div 
          className="absolute inset-0 rounded-full" 
          style={{ 
            backgroundColor: isDragging ? 'var(--color-border)' : 'var(--color-background-secondary)',
            opacity: 0.6,
          }}
        />
        
        {/* Progress Fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-150"
          style={{ 
            width: `${Math.max(0, Math.min(100, progressPercent))}%`,
            background: isDragging 
              ? `linear-gradient(90deg, var(--color-accent) 0%, var(--color-secondary) 100%)`
              : isPlaying 
                ? `linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)`
                : 'var(--color-text-muted)',
            boxShadow: isPlaying && !isDragging 
              ? `0 0 10px var(--color-primary)40` 
              : 'none',
          }}
        />
        
        {/* Drag Handle */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg
            transition-all duration-150 ease-out
            ${isHovering || isDragging ? 'opacity-100 scale-110' : 'opacity-0 scale-75'}
          `}
          style={{ 
            left: `calc(${Math.max(0, Math.min(100, progressPercent))}% - 6px)`,
            backgroundColor: '#ffffff',
            boxShadow: `0 2px 8px var(--color-shadow), 0 0 0 2px var(--color-primary)`,
          }}
        />
        
        {/* Active glow effect when playing */}
        {isPlaying && !isDragging && (
          <div
            className="absolute left-0 top-0 h-full rounded-full opacity-30 animate-pulse"
            style={{ 
              width: `${Math.max(0, Math.min(100, progressPercent))}%`,
              background: `linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
              filter: 'blur(1px)',
            }}
          />
        )}
      </div>
      
      {/* Duration */}
      <div 
        className="text-xs font-mono min-w-[40px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {formatTime(duration)}
      </div>
    </div>
  );
} 