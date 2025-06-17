import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ProgressBarProps {
  duration: number;
  progress: number;
  onSeek: (progress: number) => void;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ duration, progress, onSeek }) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (progressBarRef.current) {
        const { left, width } = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - left;
        const seekRatio = Math.max(0, Math.min(1, clickX / width));
        const newProgress = seekRatio * duration;
        setDragProgress(newProgress);
        return newProgress;
      }
      return 0;
    },
    [duration]
  );

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSeeking(true);
    handleSeek(e);
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isSeeking) {
        handleSeek(e);
      }
    },
    [isSeeking, handleSeek]
  );

  const onMouseUp = useCallback(
    () => {
      if (isSeeking) {
        const newProgress = dragProgress ?? progress;
        onSeek(newProgress);
        setIsSeeking(false);
        setDragProgress(null);
      }
    },
    [isSeeking, dragProgress, onSeek, progress]
  );

  useEffect(() => {
    if (isSeeking) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [isSeeking, onMouseMove, onMouseUp]);

  const currentProgress = dragProgress ?? progress;
  const progressPercentage = duration > 0 ? (currentProgress / duration) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      <div
        ref={progressBarRef}
        onMouseDown={onMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative h-2 bg-neutral-200/60 dark:bg-neutral-700/60 rounded-full cursor-pointer group transition-all duration-200 hover:h-3"
      >
        {/* Background Track */}
        <div className="absolute inset-0 bg-neutral-200/80 dark:bg-neutral-700/80 rounded-full" />
        
        {/* Progress Fill */}
        <div 
          className={`absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-200 ${
            isHovering || isSeeking ? 'shadow-md' : ''
          }`}
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Progress Thumb */}
          <div 
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-green-500 rounded-full shadow-lg transition-all duration-200 ${
              isHovering || isSeeking ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          />
        </div>
        
        {/* Hover Effect */}
        {isHovering && (
          <div className="absolute inset-0 bg-green-500/10 rounded-full animate-pulse" />
        )}
      </div>
      
      {/* Time Display */}
      <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-medium transition-colors">
        <span className="tabular-nums">{formatTime(currentProgress)}</span>
        <span className="tabular-nums">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar; 