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
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (progressBarRef.current) {
        const { left, width } = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - left;
        const seekRatio = Math.max(0, Math.min(1, clickX / width));
        setDragProgress(seekRatio * duration);
        return seekRatio * duration;
      }
      return 0;
    },
    [duration]
  );

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const currentProgress = dragProgress ?? progress;
  const progressPercentage = duration > 0 ? (currentProgress / duration) * 100 : 0;

  return (
    <div className="w-full">
      <div
        ref={progressBarRef}
        onMouseDown={onMouseDown}
        className="h-2 bg-white bg-opacity-20 rounded-full cursor-pointer group"
      >
        <div className="h-full bg-white rounded-full relative" style={{ width: `${progressPercentage}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-300 mt-1">
        <span>{formatTime(currentProgress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar; 