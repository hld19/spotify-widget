/**
 * 🎵 useSpotify Hook - Real-Time Everything
 * Ultra-responsive real-time updates for all playback data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../api/spotify';

interface SpotifyState {
  device: {
    id: string;
    is_active: boolean;
    name: string;
  } | null;
  shuffle_state: boolean;
  repeat_state: string;
  timestamp: number;
  context: any;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string; width: number; height: number }[];
    };
    duration_ms: number;
  } | null;
  currently_playing_type: string;
  is_playing: boolean;
}

export function useSpotify() {
  // Core state
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playerState, setPlayerState] = useState<SpotifyState | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time progress tracking
  const [realTimeProgress, setRealTimeProgress] = useState<number>(0);
  const [lastApiUpdate, setLastApiUpdate] = useState<number>(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  
  // Internal state
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
  useEffect(() => {
    console.log('🎵 Initializing real-time Spotify hook...');
    
    // Check authentication status
    const authStatus = api.isAuthenticated();
    console.log('🔍 Initial auth status:', authStatus);
    setIsAuthenticated(authStatus);
    setIsReady(true);
    
    // Listen for authentication changes more frequently
    const checkAuthPeriodically = setInterval(() => {
      const currentAuthStatus = api.isAuthenticated();
      if (currentAuthStatus !== isAuthenticated) {
        console.log('🔄 Auth status changed:', currentAuthStatus);
        setIsAuthenticated(currentAuthStatus);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(checkAuthPeriodically);
  }, [isAuthenticated]);

  // Real-time progress updater (60fps when playing)
  useEffect(() => {
    if (playerState?.is_playing && !isUserSeeking) {
      progressIntervalRef.current = setInterval(() => {
        const timeSinceLastUpdate = Date.now() - lastApiUpdate;
        const newProgress = Math.min(
          (playerState.progress_ms || 0) + timeSinceLastUpdate,
          playerState.item?.duration_ms || 0
        );
        setRealTimeProgress(newProgress);
      }, 16); // 60fps updates (16ms)
      
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    } else {
      // Use API progress when not playing or when user is seeking
      setRealTimeProgress(playerState?.progress_ms || 0);
    }
  }, [playerState, lastApiUpdate, isUserSeeking]);

  // Fetch current playback state
  const fetchPlaybackState = useCallback(async () => {
    if (!api.isAuthenticated()) {
      setIsAuthenticated(false);
      setPlayerState(null);
      return;
    }

    try {
      const state = await api.getCurrentPlayback();
      if (state) {
        setPlayerState(state);
        setLastApiUpdate(Date.now());
        setRealTimeProgress(state.progress_ms || 0);
      }
      setError(null);
    } catch (err) {
      console.error('❌ Failed to fetch playback state:', err);
      setError('Failed to fetch playback state');
      
      // If auth error, mark as unauthenticated
      if (err instanceof Error && err.message.includes('401')) {
        setIsAuthenticated(false);
      }
    }
  }, []);

  // High-frequency polling for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchPlaybackState();

    // Much faster polling for real-time feel
    const pollInterval = isVisible ? 1000 : 3000; // 1s when visible, 3s when hidden
    intervalRef.current = setInterval(fetchPlaybackState, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, isVisible, fetchPlaybackState]);

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      if (visible && isAuthenticated) {
        // Fetch immediately when becoming visible
        fetchPlaybackState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, fetchPlaybackState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          if (playerState?.is_playing) {
            controls.pause();
          } else {
            controls.play();
          }
          break;
        case 'ArrowRight':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            controls.next();
          }
          break;
        case 'ArrowLeft':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            controls.previous();
          }
          break;
        // Media keys
        case 'MediaPlayPause':
          event.preventDefault();
          if (playerState?.is_playing) {
            controls.pause();
          } else {
            controls.play();
          }
          break;
        case 'MediaTrackNext':
          event.preventDefault();
          controls.next();
          break;
        case 'MediaTrackPrevious':
          event.preventDefault();
          controls.previous();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [playerState]);

  // Control functions with immediate feedback
  const controls = {
    play: async (contextUri?: string) => {
      try {
        console.log('▶️ Playing...');
        
        // Immediate optimistic update
        if (playerState) {
          setPlayerState({ ...playerState, is_playing: true });
          setLastApiUpdate(Date.now());
        }
        
        await api.play(contextUri);
        
        // Quick refresh
        setTimeout(fetchPlaybackState, 200);
      } catch (err) {
        console.error('❌ Play failed:', err);
        setError('Failed to play');
        // Revert optimistic update
        setTimeout(fetchPlaybackState, 100);
      }
    },

    pause: async () => {
      try {
        console.log('⏸️ Pausing...');
        
        // Immediate optimistic update
        if (playerState) {
          setPlayerState({ ...playerState, is_playing: false });
        }
        
        await api.pause();
        
        // Quick refresh
        setTimeout(fetchPlaybackState, 200);
      } catch (err) {
        console.error('❌ Pause failed:', err);
        setError('Failed to pause');
        // Revert optimistic update
        setTimeout(fetchPlaybackState, 100);
      }
    },

    next: async () => {
      try {
        console.log('⏭️ Next track...');
        await api.skipToNext();
        // Immediate refresh for track changes
        setTimeout(fetchPlaybackState, 300);
      } catch (err) {
        console.error('❌ Next track failed:', err);
        setError('Failed to skip to next track');
      }
    },

    previous: async () => {
      try {
        console.log('⏮️ Previous track...');
        await api.skipToPrevious();
        // Immediate refresh for track changes
        setTimeout(fetchPlaybackState, 300);
      } catch (err) {
        console.error('❌ Previous track failed:', err);
        setError('Failed to skip to previous track');
      }
    },

    seek: async (positionMs: number) => {
      try {
        console.log(`🎯 Seeking to ${Math.floor(positionMs / 1000)}s...`);
        
        // Mark as user seeking to prevent progress interference
        setIsUserSeeking(true);
        
        // Immediate optimistic update
        if (playerState) {
          setPlayerState({ 
            ...playerState, 
            progress_ms: positionMs,
            timestamp: Date.now()
          });
          setRealTimeProgress(positionMs);
          setLastApiUpdate(Date.now());
        }
        
        // Perform the actual seek
        await api.seek(positionMs);
        
        // Quick state refresh and resume normal progress tracking
        setTimeout(() => {
          fetchPlaybackState();
          setIsUserSeeking(false);
        }, 50);
      } catch (err) {
        console.error('❌ Seek failed:', err);
        setError('Failed to seek');
        setIsUserSeeking(false);
        // Revert optimistic update on error
        setTimeout(fetchPlaybackState, 100);
      }
    },

    setVolume: async (volumePercent: number) => {
      try {
        console.log(`🔊 Setting volume to ${volumePercent}%...`);
        await api.setVolume(volumePercent);
      } catch (err) {
        console.error('❌ Volume change failed:', err);
        setError('Failed to change volume');
      }
    },
  };

  const login = () => {
    console.log('🔐 Starting login process...');
    api.login().catch((err) => {
      console.error('❌ Login failed:', err);
      setError('Login failed');
    });
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    api.logout();
    setIsAuthenticated(false);
    setPlayerState(null);
    setRealTimeProgress(0);
    setError(null);
  };

  return {
    // State
    isReady,
    isAuthenticated,
    playerState,
    error,
    isVisible,
    
    // Real-time computed values
    currentProgress: realTimeProgress,
    
    // Actions
    login,
    logout,
    controls,
    
    // Utilities
    clearError: () => setError(null),
  };
} 