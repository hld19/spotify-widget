/**
 * Sleep Timer Hook
 * Automatically pauses playback after a set duration
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface SleepTimerOptions {
  onTimerEnd: () => void;
}

export function useSleepTimer({ onTimerEnd }: SleepTimerOptions) {
  const [isActive, setIsActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(15); // minutes
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const startTimer = useCallback((minutes: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const durationMs = minutes * 60 * 1000;
    endTimeRef.current = Date.now() + durationMs;
    setRemainingTime(durationMs);
    setIsActive(true);
    setSelectedDuration(minutes);

    intervalRef.current = setInterval(() => {
      if (endTimeRef.current) {
        const remaining = Math.max(0, endTimeRef.current - Date.now());
        
        if (remaining === 0) {
          stopTimer();
          onTimerEnd();
        } else {
          setRemainingTime(remaining);
        }
      }
    }, 1000);
  }, [onTimerEnd]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
    setIsActive(false);
    setRemainingTime(0);
  }, []);

  const extendTimer = useCallback((minutes: number) => {
    if (endTimeRef.current) {
      endTimeRef.current += minutes * 60 * 1000;
      setRemainingTime(prev => prev + minutes * 60 * 1000);
    }
  }, []);
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatRemainingTime = () => {
    const totalSeconds = Math.floor(remainingTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isActive,
    remainingTime,
    selectedDuration,
    formattedTime: formatRemainingTime(),
    startTimer,
    stopTimer,
    extendTimer,
  };
} 
