/**
 * 🎵 useSpotify Hook - Real-Time Everything
 * Ultra-responsive real-time updates for all playback data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../api/spotify';
import type { SpotifyPlaylistItem, SpotifyRecentlyPlayedItem } from '../api/spotify';

interface SpotifyState {
  device: {
    id: string;
    is_active: boolean;
    name: string;
    volume_percent?: number;
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
    uri: string;
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
  
  // New state for enhanced features
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyRecentlyPlayedItem[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylistItem[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [volume, setVolume] = useState<number>(50);
  const [updateInterval, setUpdateInterval] = useState<number>(1000);
  const [queue, setQueue] = useState<any>({ queue: [] });
  const [savedTracks, setSavedTracks] = useState<Record<string, boolean>>({});
  
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
        setVolume(state.device?.volume_percent || 50);
        
        // Fetch queue periodically
        if (state.is_playing) {
          const queueData = await api.getQueue();
          setQueue(queueData);
        }
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

  // Fetch recently played tracks
  const fetchRecentlyPlayed = useCallback(async () => {
    if (!api.isAuthenticated()) return;
    
    try {
      const tracks = await api.getRecentlyPlayed(20);
      setRecentlyPlayed(tracks);
    } catch (err) {
      console.error('Failed to fetch recently played:', err);
    }
  }, []);

  // Fetch user playlists
  const fetchPlaylists = useCallback(async () => {
    if (!api.isAuthenticated()) return;
    
    try {
      const userPlaylists = await api.getUserPlaylists(50);
      setPlaylists(userPlaylists);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
    }
  }, []);

  // Fetch available devices
  const fetchDevices = useCallback(async () => {
    if (!api.isAuthenticated()) return;
    
    try {
      const availableDevices = await api.getDevices();
      setDevices(availableDevices);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  }, []);

  // High-frequency polling for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchPlaybackState();
    fetchRecentlyPlayed();
    fetchPlaylists();
    fetchDevices();

    // Much faster polling for real-time feel
    const pollInterval = isVisible ? 1000 : 3000; // 1s when visible, 3s when hidden
    intervalRef.current = setInterval(fetchPlaybackState, pollInterval);
    
    // Less frequent updates for other data
    const dataInterval = setInterval(() => {
      fetchRecentlyPlayed();
      fetchDevices();
    }, 30000); // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(dataInterval);
    };
  }, [isAuthenticated, isVisible, fetchPlaybackState, fetchRecentlyPlayed, fetchPlaylists, fetchDevices]);

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

      // Ctrl/Cmd shortcuts
      const ctrlOrCmd = event.ctrlKey || event.metaKey;

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
          if (ctrlOrCmd) {
            event.preventDefault();
            controls.next();
          }
          break;
        case 'ArrowLeft':
          if (ctrlOrCmd) {
            event.preventDefault();
            controls.previous();
          }
          break;
        case 'ArrowUp':
          if (ctrlOrCmd) {
            event.preventDefault();
            const newVolume = Math.min(100, volume + 10);
            controls.setVolume(newVolume);
          }
          break;
        case 'ArrowDown':
          if (ctrlOrCmd) {
            event.preventDefault();
            const newVolume = Math.max(0, volume - 10);
            controls.setVolume(newVolume);
          }
          break;
        case 's':
        case 'S':
          if (ctrlOrCmd) {
            event.preventDefault();
            controls.setShuffle(!playerState?.shuffle_state);
          }
          break;
        case 'r':
        case 'R':
          if (ctrlOrCmd) {
            event.preventDefault();
            const states: Array<'track' | 'context' | 'off'> = ['off', 'context', 'track'];
            const currentIndex = states.indexOf(playerState?.repeat_state as any) || 0;
            const nextState = states[(currentIndex + 1) % 3];
            controls.setRepeat(nextState);
          }
          break;
        case 'm':
        case 'M':
          if (ctrlOrCmd) {
            event.preventDefault();
            // Dispatch custom event for mini mode toggle
            window.dispatchEvent(new CustomEvent('toggle-mini-mode'));
          }
          break;
        case 'h':
        case 'H':
          if (ctrlOrCmd) {
            event.preventDefault();
            // Dispatch custom event for tabs toggle
            window.dispatchEvent(new CustomEvent('toggle-tabs'));
          }
          break;
        case 'l':
        case 'L':
          if (ctrlOrCmd && playerState?.item) {
            event.preventDefault();
            // TODO: Implement like/save track
            console.log('Like track:', playerState.item.name);
          }
          break;
        case 'q':
        case 'Q':
          if (ctrlOrCmd && playerState?.item) {
            event.preventDefault();
            controls.addToQueue(`spotify:track:${playerState.item.id}`);
          }
          break;
        case '/':
          if (ctrlOrCmd) {
            event.preventDefault();
            // Dispatch custom event for search focus
            window.dispatchEvent(new CustomEvent('focus-search'));
          }
          break;
        case '?':
          event.preventDefault();
          // Dispatch custom event to show shortcuts
          window.dispatchEvent(new CustomEvent('show-shortcuts'));
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
  }, [playerState, volume]);

  // Control functions with immediate feedback
  const controls = {
    play: async (contextUri?: string, uris?: string[]) => {
      try {
        console.log('▶️ Playing...');
        
        // Immediate optimistic update
        if (playerState) {
          setPlayerState({ ...playerState, is_playing: true });
          setLastApiUpdate(Date.now());
        }
        
        await api.play(contextUri, uris);
        
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
        setVolume(volumePercent); // Optimistic update
        await api.setVolume(volumePercent);
      } catch (err) {
        console.error('❌ Volume change failed:', err);
        setError('Failed to change volume');
      }
    },

    setShuffle: async (state: boolean) => {
      try {
        console.log(`🔀 Setting shuffle to ${state}...`);
        // Optimistic update
        if (playerState) {
          setPlayerState({ ...playerState, shuffle_state: state });
        }
        await api.setShuffle(state);
        setTimeout(fetchPlaybackState, 200);
      } catch (err) {
        console.error('❌ Shuffle change failed:', err);
        setError('Failed to change shuffle state');
        setTimeout(fetchPlaybackState, 100);
      }
    },
    
    setRepeat: async (state: 'track' | 'context' | 'off') => {
      try {
        console.log(`🔁 Setting repeat to ${state}...`);
        // Optimistic update
        if (playerState) {
          setPlayerState({ ...playerState, repeat_state: state });
        }
        await api.setRepeat(state);
        setTimeout(fetchPlaybackState, 200);
      } catch (err) {
        console.error('❌ Repeat change failed:', err);
        setError('Failed to change repeat state');
        setTimeout(fetchPlaybackState, 100);
      }
    },
    
    playTrack: async (uri: string) => {
      try {
        console.log('▶️ Playing track:', uri);
        await api.playTrack(uri);
        setTimeout(fetchPlaybackState, 300);
      } catch (err) {
        console.error('❌ Play track failed:', err);
        setError('Failed to play track');
      }
    },
    
    playPlaylist: async (uri: string, shuffle: boolean = false) => {
      try {
        console.log('▶️ Playing playlist:', uri);
        if (shuffle) {
          await api.setShuffle(true);
        }
        await api.playContext(uri);
        setTimeout(fetchPlaybackState, 300);
      } catch (err) {
        console.error('❌ Play playlist failed:', err);
        setError('Failed to play playlist');
      }
    },
    
    addToQueue: async (uri: string) => {
      try {
        console.log('➕ Adding to queue:', uri);
        await api.addToQueue(uri);
        setError(null);
      } catch (err) {
        console.error('❌ Add to queue failed:', err);
        setError('Failed to add to queue');
      }
    },
    
    transferPlayback: async (deviceId: string) => {
      try {
        console.log('📱 Transferring playback to device:', deviceId);
        await api.transferPlayback(deviceId);
        setTimeout(() => {
          fetchPlaybackState();
          fetchDevices();
        }, 300);
      } catch (err) {
        console.error('❌ Transfer playback failed:', err);
        setError('Failed to transfer playback');
      }
    },

    saveTrack: async (trackId: string, save: boolean = true) => {
      try {
        await api.saveTrack(trackId, save);
        setSavedTracks(prev => ({
          ...prev,
          [trackId]: save
        }));
        const notification = document.createElement('div');
        notification.textContent = save ? 'Added to Liked Songs' : 'Removed from Liked Songs';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.backgroundColor = '#1db954';
        notification.style.color = '#ffffff';
        notification.style.zIndex = '9999';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } catch (error) {
        console.error('❌ Save track failed:', error);
        setError('Failed to save track');
      }
    }
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
    recentlyPlayed,
    playlists,
    devices,
    volume,
    
    // Real-time computed values
    currentProgress: realTimeProgress,
    
    // Actions
    login,
    logout,
    controls,
    
    // Utilities
    clearError: () => setError(null),
    refreshRecentlyPlayed: fetchRecentlyPlayed,
    refreshPlaylists: fetchPlaylists,
    refreshDevices: fetchDevices,
    queue,
    savedTracks
  };
} 