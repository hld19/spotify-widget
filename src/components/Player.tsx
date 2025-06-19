/**
 * Player Component - Completely Revamped Horizontal Widget
 * Modern, feature-rich Spotify controller with playlist support
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  Cog6ToothIcon,
  SpeakerWaveIcon,
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  QueueListIcon,
  ClockIcon,
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  HeartIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ViewColumnsIcon,
  ShareIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/solid';
import { SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import ProgressBar from './ProgressBar';
import { useSpotify } from '../hooks/useSpotify';
import { useTheme } from '../hooks/useTheme';
import { useTrackHistory } from '../hooks/useTrackHistory';
import { useSleepTimer } from '../hooks/useSleepTimer';
import { useGestures } from '../hooks/useGestures';
import KeyboardShortcuts from './KeyboardShortcuts';
import Visualizer from './Visualizer';
import AudioSettings from './AudioSettings';
import Lyrics from './Lyrics';
import '../api/spotify';

type TabType = 'now-playing' | 'recent' | 'playlists' | 'search' | 'devices' | 'stats' | 'queue' | 'discover';

export default function Player() {
  const [activeTab, setActiveTab] = useState<TabType>('now-playing');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [showTabs, setShowTabs] = useState(true);
  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('compactMode') === 'true';
  });
  const [miniMode, setMiniMode] = useState(() => {
    return localStorage.getItem('miniMode') === 'true';
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);

  const { 
    isReady, 
    isAuthenticated, 
    playerState, 
    currentProgress,
    error,
    login, 
    logout,
    controls,
    clearError,
    recentlyPlayed,
    playlists,
    devices,
    volume,
    refreshDevices,
    queue,
    savedTracks
  } = useSpotify();

  const {
    isDarkMode,
    currentTheme,
    updateTheme,
    cssVariables
  } = useTheme();

  const {
    history,
    addTrack,
    getStats,
    clearHistory
  } = useTrackHistory();

  const sleepTimer = useSleepTimer({
    onTimerEnd: () => {
      controls.pause();
      // Show notification
      const notification = document.createElement('div');
      notification.textContent = 'Sleep timer ended - playback paused';
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.padding = '12px 20px';
      notification.style.borderRadius = '8px';
      notification.style.backgroundColor = currentTheme.accent;
      notification.style.color = '#ffffff';
      notification.style.zIndex = '9999';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    }
  });

  // Update theme when album artwork changes
  useEffect(() => {
    if (playerState?.item?.album?.images?.[0]?.url) {
      updateTheme(playerState.item.album.images[0].url);
    }
  }, [playerState?.item?.album?.images?.[0]?.url, updateTheme]);

  // Track history
  useEffect(() => {
    if (playerState?.item && playerState.is_playing) {
      addTrack(playerState.item);
    }
  }, [playerState?.item?.id, playerState?.is_playing, addTrack]);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [cssVariables]);

  // Apply compact mode
  useEffect(() => {
    localStorage.setItem('compactMode', compactMode.toString());
  }, [compactMode]);

  // Apply mini mode
  useEffect(() => {
    localStorage.setItem('miniMode', miniMode.toString());
  }, [miniMode]);

  // Listen for custom events
  useEffect(() => {
    const handleToggleMiniMode = () => {
      setMiniMode(prev => {
        const newValue = !prev;
        localStorage.setItem('miniMode', newValue.toString());
        return newValue;
      });
    };

    const handleToggleTabs = () => {
      setShowTabs(prev => !prev);
    };

    const handleShowShortcuts = () => {
      setShowShortcuts(true);
    };

    const handleFocusSearch = () => {
      setActiveTab('search');
      // Focus search input after tab change
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }, 100);
    };

    window.addEventListener('toggle-mini-mode', handleToggleMiniMode);
    window.addEventListener('toggle-tabs', handleToggleTabs);
    window.addEventListener('show-shortcuts', handleShowShortcuts);
    window.addEventListener('focus-search', handleFocusSearch);

    return () => {
      window.removeEventListener('toggle-mini-mode', handleToggleMiniMode);
      window.removeEventListener('toggle-tabs', handleToggleTabs);
      window.removeEventListener('show-shortcuts', handleShowShortcuts);
      window.removeEventListener('focus-search', handleFocusSearch);
    };
  }, []);

  // Load recommendations based on current track
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!playerState?.item?.id) return;
      
      setIsLoadingRecommendations(true);
      try {
        const { getRecommendations } = await import('../api/spotify');
        const data = await getRecommendations([playerState.item.id]);
        setRecommendations(data.tracks || []);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [playerState?.item?.id]);

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const { search } = await import('../api/spotify');
      const results = await search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Share functionality
  const shareTrack = () => {
    if (!item) return;
    
    const trackUrl = `https://open.spotify.com/track/${item.id}`;
    const shareText = `🎵 Now playing: ${item.name} by ${item.artists.map(a => a.name).join(', ')}`;
    
    // Try native share API first
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: shareText,
        url: trackUrl,
      }).catch(() => {
        // Fallback to clipboard
        copyToClipboard(trackUrl);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(trackUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show success notification
      const notification = document.createElement('div');
      notification.textContent = 'Track link copied to clipboard!';
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.padding = '12px 20px';
      notification.style.borderRadius = '8px';
      notification.style.backgroundColor = currentTheme.primary;
      notification.style.color = '#ffffff';
      notification.style.zIndex = '9999';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    });
  };

  // Load playlist tracks
  const loadPlaylistTracks = async (playlistId: string) => {
    try {
      const { getPlaylistTracks } = await import('../api/spotify');
      const tracks = await getPlaylistTracks(playlistId);
      setPlaylistTracks(tracks);
      setSelectedPlaylist(playlistId);
    } catch (err) {
      console.error('Failed to load playlist tracks:', err);
    }
  };

  // Gesture controls
  const tabOrder: TabType[] = ['now-playing', 'recent', 'playlists', 'search', 'devices', 'stats', 'queue', 'discover'];
  
  useGestures(playerRef, {
    onSwipeLeft: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabOrder.length;
      setActiveTab(tabOrder[nextIndex]);
    },
    onSwipeRight: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      const prevIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
      setActiveTab(tabOrder[prevIndex]);
    },
    onSwipeUp: () => {
      setShowTabs(false);
    },
    onSwipeDown: () => {
      setShowTabs(true);
    },
    onDoubleTap: () => {
      if (is_playing) {
        controls.pause();
      } else {
        controls.play();
      }
    },
    onLongPress: () => {
      setMiniMode(!miniMode);
      localStorage.setItem('miniMode', (!miniMode).toString());
    },
    onPinchZoom: (scale) => {
      if (scale > 1.2) {
        setCompactMode(false);
        localStorage.setItem('compactMode', 'false');
      } else if (scale < 0.8) {
        setCompactMode(true);
        localStorage.setItem('compactMode', 'true');
      }
    }
  });

  // Loading state
  if (!isReady) {
    return (
      <div 
        data-tauri-drag-region
        className="w-full h-full flex items-center justify-center rounded-2xl text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
        }}
      >
        <div className="flex flex-col items-center space-y-4 z-10">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{
                borderColor: `${currentTheme.primary}30`,
                borderTopColor: currentTheme.primary,
              }}
          />
          <span className="text-sm font-medium" style={{ color: currentTheme.textSecondary }}>
            Initializing...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div 
        data-tauri-drag-region
        className="w-full h-full flex items-center justify-center rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
        }}
      >
        <div className="text-center max-w-sm z-10">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`,
            }}
          >
            <MusicalNoteIcon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-3" style={{ color: currentTheme.text }}>
            Spotify Widget
          </h1>
          <p className="mb-6 leading-relaxed" style={{ color: currentTheme.textSecondary }}>
            Connect your Spotify account to control your music
          </p>
          
          <button 
            onClick={login}
            className="font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`,
              color: '#ffffff',
            }}
          >
            Connect Spotify
          </button>
          
          {error && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No music playing state - check if there's an active device
  if (!playerState) {
    return (
      <div 
        data-tauri-drag-region
        className="w-full h-full rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
          color: currentTheme.text,
        }}
      >
        <div className="text-center max-w-sm">
          <ComputerDesktopIcon className="w-12 h-12 mx-auto mb-3" style={{ color: currentTheme.textMuted }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: currentTheme.text }}>
            No Active Device
          </h2>
          <p className="text-sm mb-4" style={{ color: currentTheme.textSecondary }}>
            Open Spotify on your computer or phone to start controlling playback
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Link 
              to="/settings"
              className="p-2 rounded-lg transition-colors"
              style={{ color: currentTheme.textMuted }}
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { item, is_playing, shuffle_state, repeat_state } = playerState || {};
  const hasPlayback = item && playerState;

  // Determine sizing based on compact mode
  const albumArtSize = compactMode ? 'w-10 h-10' : 'w-12 h-12';
  const controlButtonSize = compactMode ? 'w-4 h-4' : 'w-5 h-5';
  const smallControlSize = compactMode ? 'w-3 h-3' : 'w-4 h-4';
  const playButtonPadding = compactMode ? 'p-1.5' : 'p-2';
  const sectionPadding = compactMode ? 'p-2' : 'p-3';
  const tabHeight = compactMode ? 'h-32' : 'h-40';

  // Mini mode view
  if (miniMode && hasPlayback) {
    return (
      <div 
        data-tauri-drag-region
        className="w-full h-full rounded-2xl overflow-hidden flex items-center p-2"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
          color: currentTheme.text,
          maxHeight: '60px'
        }}
      >
        {/* Mini Album Art */}
        <img
          src={item.album.images[0]?.url || ''}
          alt=""
          className="w-8 h-8 rounded"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+PC9zdmc+';
          }}
        />
        
        {/* Track Info */}
        <div className="flex-1 mx-2 min-w-0">
          <p className="text-xs font-medium truncate">{item.name}</p>
          <p className="text-[10px] truncate" style={{ color: currentTheme.textSecondary }}>
            {item.artists.map(a => a.name).join(', ')}
          </p>
        </div>
        
        {/* Mini Controls */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={controls.previous}
            className="p-1 rounded transition-all hover:scale-110"
            style={{ color: currentTheme.textSecondary }}
          >
            <BackwardIcon className="w-3 h-3" />
            </button>
          
            <button
            onClick={() => is_playing ? controls.pause() : controls.play()}
            className="p-1 rounded-full"
            style={{
              background: currentTheme.primary,
              color: '#ffffff',
            }}
          >
            {is_playing ? 
              <PauseIcon className="w-3 h-3" /> : 
              <PlayIcon className="w-3 h-3" />
            }
            </button>
          
          <button 
            onClick={controls.next}
            className="p-1 rounded transition-all hover:scale-110"
            style={{ color: currentTheme.textSecondary }}
          >
            <ForwardIcon className="w-3 h-3" />
          </button>
          
          {/* Exit mini mode */}
          <button
            onClick={() => {
              setMiniMode(false);
              localStorage.setItem('miniMode', 'false');
            }}
            className="p-1 rounded ml-1"
            style={{ color: currentTheme.textMuted }}
          >
            <ChevronUpIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={playerRef}
      data-tauri-drag-region 
      className="w-full h-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.background} 0%, ${currentTheme.backgroundSecondary} 100%)`,
        color: currentTheme.text,
      }}
    >
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - Album Art & Current Track */}
        <div className={`flex items-center ${sectionPadding} space-x-3 border-r`} style={{ borderColor: currentTheme.border }}>
          {hasPlayback ? (
            <>
              {/* Album Art */}
              <img
                src={item.album.images[0]?.url || ''}
                alt="Album Art"
                className={`${albumArtSize} rounded-lg shadow-lg flex-shrink-0`}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+PC9zdmc+';
                }}
              />
              
              {/* Track Info */}
              <div className="min-w-0 max-w-[150px]">
                <h3 className={`font-medium ${compactMode ? 'text-xs' : 'text-sm'} truncate`} style={{ color: currentTheme.text }}>
                  {item.name}
                </h3>
                <p className={`${compactMode ? 'text-[10px]' : 'text-xs'} truncate`} style={{ color: currentTheme.textSecondary }}>
                  {item.artists.map(a => a.name).join(', ')}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className={`${albumArtSize} rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse`} />
              <div>
                <p className={`${compactMode ? 'text-[10px]' : 'text-xs'}`} style={{ color: currentTheme.textMuted }}>Nothing playing</p>
                <p className={`${compactMode ? 'text-[10px]' : 'text-xs'}`} style={{ color: currentTheme.textMuted }}>Play from Spotify</p>
              </div>
        </div>
      )}
        </div>

        {/* Center Section - Controls & Progress */}
        <div className={`flex-1 flex flex-col justify-center ${compactMode ? 'px-2' : 'px-4'}`}>
          {/* Playback Controls */}
          <div className={`flex items-center justify-center ${compactMode ? 'space-x-2 mb-1' : 'space-x-3 mb-2'}`}>
            {/* Shuffle */}
            <button
              onClick={() => controls.setShuffle(!shuffle_state)}
              className={`${compactMode ? 'p-1' : 'p-1.5'} rounded-lg transition-all ${shuffle_state ? 'opacity-100' : 'opacity-50'}`}
              style={{ color: shuffle_state ? currentTheme.primary : currentTheme.textSecondary }}
              title="Toggle shuffle"
            >
              <ArrowsRightLeftIcon className={smallControlSize} />
            </button>

            {/* Previous */}
            <button 
              onClick={controls.previous}
              className={`${compactMode ? 'p-1' : 'p-1.5'} rounded-lg transition-all hover:scale-110`}
              style={{ color: currentTheme.text }}
            >
              <BackwardIcon className={controlButtonSize} />
            </button>
            
            {/* Play/Pause */}
            <button 
              onClick={() => is_playing ? controls.pause() : controls.play()}
              className={`${playButtonPadding} rounded-full shadow-lg transition-all hover:scale-110`}
          style={{
                background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`,
            color: '#ffffff',
          }}
        >
              {is_playing ? 
                <PauseIcon className={controlButtonSize} /> : 
                <PlayIcon className={`${controlButtonSize} ml-0.5`} />
              }
            </button>
            
            {/* Next */}
          <button 
              onClick={controls.next}
              className={`${compactMode ? 'p-1' : 'p-1.5'} rounded-lg transition-all hover:scale-110`}
              style={{ color: currentTheme.text }}
            >
              <ForwardIcon className={controlButtonSize} />
            </button>

            {/* Repeat */}
            <button
              onClick={() => {
                const states: Array<'track' | 'context' | 'off'> = ['off', 'context', 'track'];
                const currentIndex = states.indexOf(repeat_state as any) || 0;
                const nextState = states[(currentIndex + 1) % 3];
                controls.setRepeat(nextState);
              }}
              className={`${compactMode ? 'p-1' : 'p-1.5'} rounded-lg transition-all relative ${repeat_state !== 'off' ? 'opacity-100' : 'opacity-50'}`}
              style={{ color: repeat_state !== 'off' ? currentTheme.primary : currentTheme.textSecondary }}
              title={`Repeat: ${repeat_state}`}
            >
              <ArrowPathRoundedSquareIcon className={smallControlSize} />
              {repeat_state === 'track' && (
                <span className={`absolute -top-1 -right-1 ${compactMode ? 'text-[10px]' : 'text-xs'} font-bold`}>1</span>
              )}
          </button>
          </div>

          {/* Progress Bar */}
          {hasPlayback && (
            <div className="w-full max-w-xl mx-auto">
              <ProgressBar
                currentProgress={currentProgress}
                duration={item.duration_ms}
                isPlaying={is_playing || false}
                onSeek={controls.seek}
              />
        </div>
      )}
        </div>

        {/* Right Section - Volume & Settings */}
        <div className={`flex items-center ${sectionPadding} space-x-1 border-l`} style={{ borderColor: currentTheme.border }}>
          {/* Volume Control */}
          <div className="relative">
            <button
              onClick={() => setIsVolumeVisible(!isVolumeVisible)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: currentTheme.textSecondary }}
            >
              {volume === 0 ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
            </button>
            
            {isVolumeVisible && (
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg shadow-lg"
                style={{ backgroundColor: currentTheme.backgroundSecondary }}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => controls.setVolume(parseInt(e.target.value))}
                  className="w-24 h-2"
                  style={{ accentColor: currentTheme.primary }}
                />
              </div>
            )}
          </div>

          {/* Show/Hide Tabs */}
          <button
            onClick={() => setShowTabs(!showTabs)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: currentTheme.textSecondary }}
            title={showTabs ? "Hide tabs" : "Show tabs"}
          >
            {showTabs ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
          </button>

          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => {
                if (sleepTimer.isActive) {
                  sleepTimer.stopTimer();
                } else {
                  // Show timer options
                  const menu = document.getElementById('sleep-timer-menu');
                  if (menu) {
                    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                  }
                }
              }}
              className={`p-2 rounded-lg transition-colors ${sleepTimer.isActive ? 'text-orange-500' : ''}`}
              style={{ color: sleepTimer.isActive ? currentTheme.accent : currentTheme.textSecondary }}
              title={sleepTimer.isActive ? `Sleep timer: ${sleepTimer.formattedTime}` : "Sleep timer"}
            >
              <ClockIcon className="w-4 h-4" />
            </button>
            
            {/* Timer Menu */}
            <div 
              id="sleep-timer-menu"
              className="absolute top-full right-0 mt-2 p-2 rounded-lg shadow-lg"
              style={{ 
                backgroundColor: currentTheme.backgroundSecondary,
                display: 'none',
                minWidth: '150px',
                zIndex: 50
              }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.text }}>
                Sleep Timer
              </p>
              <div className="space-y-1">
                {[15, 30, 45, 60, 90, 120].map(minutes => (
                <button
                    key={minutes}
                    onClick={() => {
                      sleepTimer.startTimer(minutes);
                      document.getElementById('sleep-timer-menu')!.style.display = 'none';
                    }}
                    className="w-full text-left px-2 py-1 text-xs rounded hover:bg-opacity-10"
                    style={{ 
                      color: currentTheme.textSecondary,
                      backgroundColor: 'transparent' 
                    }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = currentTheme.primary + '20';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                    {minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hour${minutes > 60 ? 's' : ''}`}
                </button>
                ))}
              </div>
          </div>
        </div>

          {/* Mini Mode */}
          {hasPlayback && (
            <button
              onClick={() => {
                setMiniMode(true);
                localStorage.setItem('miniMode', 'true');
              }}
              className="p-2 rounded-lg transition-colors"
              style={{ color: currentTheme.textSecondary }}
              title="Mini mode"
            >
              <ViewColumnsIcon className="w-4 h-4" />
            </button>
          )}

          {/* Audio Settings */}
          <button
            onClick={() => setShowAudioSettings(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: currentTheme.textSecondary }}
            title="Audio settings"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </button>

          {/* Settings */}
          <Link 
            to="/settings"
            className="p-2 rounded-lg transition-colors"
                style={{ color: currentTheme.textSecondary }}
              >
            <Cog6ToothIcon className="w-5 h-5" />
          </Link>
        </div>
            </div>
            
      {/* Bottom Section - Tabs */}
      {showTabs && (
        <div className="border-t" style={{ borderColor: currentTheme.border }}>
          {/* Tab Navigation */}
          <div className="flex border-b" style={{ borderColor: currentTheme.border }}>
              <button 
              onClick={() => setActiveTab('now-playing')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium transition-colors ${
                activeTab === 'now-playing' ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === 'now-playing' ? currentTheme.primary : currentTheme.textSecondary,
                borderColor: currentTheme.primary,
              }}
            >
              Playing
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium transition-colors ${
                activeTab === 'recent' ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === 'recent' ? currentTheme.primary : currentTheme.textSecondary,
                borderColor: currentTheme.primary,
              }}
            >
              Recent
              </button>
              <button
              onClick={() => setActiveTab('playlists')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium transition-colors ${
                activeTab === 'playlists' ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === 'playlists' ? currentTheme.primary : currentTheme.textSecondary,
                borderColor: currentTheme.primary,
              }}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium transition-colors ${
                activeTab === 'search' ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === 'search' ? currentTheme.primary : currentTheme.textSecondary,
                borderColor: currentTheme.primary,
              }}
            >
              Search
              </button>
            <button
              onClick={() => {
                setActiveTab('devices');
                refreshDevices();
              }}
              className={`flex-1 py-1.5 px-2 text-xs font-medium transition-colors ${
                activeTab === 'devices' ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === 'devices' ? currentTheme.primary : currentTheme.textSecondary,
                borderColor: currentTheme.primary,
              }}
            >
              Devices
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium transition-colors ${
                activeTab === 'stats' ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === 'stats' ? currentTheme.primary : currentTheme.textSecondary,
                borderColor: currentTheme.primary,
              }}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium transition-colors ${
                activeTab === 'queue' ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === 'queue' ? currentTheme.primary : currentTheme.textSecondary,
                borderColor: currentTheme.primary,
              }}
            >
              Queue
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium transition-colors ${
                activeTab === 'discover' ? 'border-b-2' : ''
              }`}
              style={{
                color: activeTab === 'discover' ? currentTheme.primary : currentTheme.textSecondary,
                borderColor: currentTheme.primary,
              }}
            >
              Discover
            </button>
            </div>

          {/* Tab Content */}
          <div className={tabHeight + ' overflow-y-auto'}>
            {/* Now Playing Tab */}
            {activeTab === 'now-playing' && hasPlayback && (
              <div className="p-4 relative">
                {/* Visualizer Background */}
                <div className="absolute inset-0 overflow-hidden">
                  <Visualizer isPlaying={is_playing} className="absolute inset-0 opacity-30" />
          </div>
          
                <div className="flex items-start space-x-4 relative z-10">
                  <img
                    src={item.album.images[0]?.url || ''}
                    alt="Album Art"
                    className="w-24 h-24 rounded-lg shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg" style={{ color: currentTheme.text }}>{item.name}</h3>
                    <p style={{ color: currentTheme.textSecondary }}>{item.artists.map(a => a.name).join(', ')}</p>
                    <p className="text-sm" style={{ color: currentTheme.textMuted }}>{item.album.name}</p>
                    <div className="flex space-x-2 mt-2">
            <button 
                        onClick={() => controls.addToQueue(`spotify:track:${item.id}`)}
                        className="p-1 rounded transition-colors"
              style={{ color: currentTheme.textSecondary }}
                        title="Add to queue"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const isLiked = savedTracks[item.id] || false;
                          controls.saveTrack(item.id, !isLiked);
                        }}
                        className="p-1 rounded transition-colors"
                        style={{ color: savedTracks[item.id] ? currentTheme.primary : currentTheme.textSecondary }}
                        title={savedTracks[item.id] ? "Unlike" : "Like"}
                      >
                        <HeartIcon className={`w-4 h-4 ${savedTracks[item.id] ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={shareTrack}
                        className="p-1 rounded transition-colors"
                        style={{ color: currentTheme.textSecondary }}
                        title="Share"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowLyrics(true)}
                        className="p-1 rounded transition-colors"
                        style={{ color: currentTheme.textSecondary }}
                        title="Lyrics"
                      >
                        <MusicalNoteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recently Played Tab */}
            {activeTab === 'recent' && (
              <div className="p-2">
                {recentlyPlayed.length > 0 ? (
                  <div className="space-y-1">
                    {recentlyPlayed.map((item, index) => (
                      <div
                        key={`${item.track.id}-${index}`}
                        className="flex items-center p-2 rounded hover:bg-opacity-10 cursor-pointer group"
                        style={{ backgroundColor: `${currentTheme.backgroundSecondary}00` }}
              onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}30`;
              }}
              onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}00`;
                        }}
                        onClick={() => controls.playTrack(item.track.id)}
                      >
                        <img
                          src={item.track.album.images[2]?.url || item.track.album.images[0]?.url}
                          alt=""
                          className="w-10 h-10 rounded"
                        />
                        <div className="flex-1 min-w-0 mx-3">
                          <p className="text-sm font-medium truncate" style={{ color: currentTheme.text }}>
                            {item.track.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: currentTheme.textSecondary }}>
                            {item.track.artists.map(a => a.name).join(', ')}
                          </p>
                        </div>
                        <PlayIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: currentTheme.primary }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: currentTheme.textMuted }}>No recently played tracks</p>
                )}
              </div>
            )}

            {/* Playlists Tab */}
            {activeTab === 'playlists' && (
              <div className="p-2">
                {playlists.length > 0 ? (
                  <div className="space-y-1">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center p-2 rounded hover:bg-opacity-10 cursor-pointer group"
                        style={{ backgroundColor: `${currentTheme.backgroundSecondary}00` }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}30`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}00`;
                        }}
                        onClick={() => controls.playPlaylist(playlist.uri, shuffle_state)}
                      >
                        <img
                          src={playlist.images[0]?.url || ''}
                          alt=""
                          className="w-10 h-10 rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNTU1Ii8+PC9zdmc+';
                          }}
                        />
                        <div className="flex-1 min-w-0 mx-3">
                          <p className="text-sm font-medium truncate" style={{ color: currentTheme.text }}>
                            {playlist.name}
                          </p>
                          <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                            {playlist.tracks.total} tracks
                          </p>
                        </div>
                        <QueueListIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: currentTheme.primary }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: currentTheme.textMuted }}>No playlists found</p>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="p-4">
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for songs, artists, albums..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{
                      backgroundColor: currentTheme.backgroundSecondary,
                      color: currentTheme.text,
                      borderColor: currentTheme.border,
                    }}
                  />
                  <button
                    onClick={handleSearch}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: currentTheme.primary, color: '#ffffff' }}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {searchResults?.tracks?.items && (
                  <div className="space-y-1">
                    {searchResults.tracks.items.slice(0, 10).map((track: any) => (
                      <div
                        key={track.id}
                        className="flex items-center p-2 rounded hover:bg-opacity-10 cursor-pointer group"
                        style={{ backgroundColor: `${currentTheme.backgroundSecondary}00` }}
              onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}30`;
              }}
              onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}00`;
                        }}
                        onClick={() => controls.playTrack(track.id)}
                      >
                        <img
                          src={track.album.images[2]?.url || track.album.images[0]?.url}
                          alt=""
                          className="w-10 h-10 rounded"
                        />
                        <div className="flex-1 min-w-0 mx-3">
                          <p className="text-sm font-medium truncate" style={{ color: currentTheme.text }}>
                            {track.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: currentTheme.textSecondary }}>
                            {track.artists.map((a: any) => a.name).join(', ')}
                          </p>
                        </div>
                        <PlayIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: currentTheme.primary }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="p-2">
                {devices.length > 0 ? (
                  <div className="space-y-1">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className={`flex items-center p-2 rounded cursor-pointer ${device.is_active ? 'bg-opacity-20' : 'hover:bg-opacity-10'}`}
                        style={{ backgroundColor: device.is_active ? `${currentTheme.primary}30` : `${currentTheme.backgroundSecondary}00` }}
                        onMouseEnter={(e) => {
                          if (!device.is_active) {
                            e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}30`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!device.is_active) {
                            e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}00`;
                          }
                        }}
                        onClick={() => !device.is_active && controls.transferPlayback(device.id)}
                      >
                        <ComputerDesktopIcon className="w-5 h-5 mr-3" style={{ color: device.is_active ? currentTheme.primary : currentTheme.textSecondary }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: currentTheme.text }}>
                            {device.name}
                          </p>
                          <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                            {device.type} {device.is_active && '• Active'}
                          </p>
                        </div>
                        {device.volume_percent !== null && (
                          <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
                            {device.volume_percent}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: currentTheme.textMuted }}>No devices found</p>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="p-4">
                {(() => {
                  const stats = getStats();
                  const formatDuration = (ms: number) => {
                    const hours = Math.floor(ms / 3600000);
                    const minutes = Math.floor((ms % 3600000) / 60000);
                    return `${hours}h ${minutes}m`;
                  };

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: currentTheme.backgroundSecondary + '30' }}
                        >
                          <p className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
                            {stats.totalTracks}
                          </p>
                          <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                            Tracks Played
                          </p>
                        </div>
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: currentTheme.backgroundSecondary + '30' }}
                        >
                          <p className="text-2xl font-bold" style={{ color: currentTheme.secondary }}>
                            {stats.uniqueTracks}
                          </p>
                          <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                            Unique Tracks
                          </p>
                        </div>
                      </div>

                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: currentTheme.backgroundSecondary + '30' }}
                      >
                        <p className="text-lg font-bold" style={{ color: currentTheme.accent }}>
                          {formatDuration(stats.totalDuration)}
                        </p>
                        <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                          Total Listening Time
                        </p>
                      </div>

                      {stats.mostPlayedTrack && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold" style={{ color: currentTheme.textSecondary }}>
                            Most Played Track
                          </p>
                          <div className="flex items-center space-x-3">
                            <img
                              src={stats.mostPlayedTrack.track.album.images[2]?.url || stats.mostPlayedTrack.track.album.images[0]?.url}
                              alt=""
                              className="w-10 h-10 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {stats.mostPlayedTrack.track.name}
                              </p>
                              <p className="text-xs truncate" style={{ color: currentTheme.textSecondary }}>
                                {stats.mostPlayedTrack.count} plays
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {stats.mostPlayedArtist && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: currentTheme.textSecondary }}>
                            Most Played Artist
                          </p>
                          <p className="font-medium">{stats.mostPlayedArtist.artist}</p>
                          <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                            {stats.mostPlayedArtist.count} plays
                          </p>
                        </div>
                      )}
            
            <button 
                        onClick={() => {
                          if (confirm('Clear all listening history?')) {
                            clearHistory();
                          }
                        }}
                        className="w-full py-2 text-xs rounded-lg transition-colors"
                        style={{
                          backgroundColor: currentTheme.accent + '20',
                          color: currentTheme.accent,
                        }}
                      >
                        Clear History
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Queue Tab */}
            {activeTab === 'queue' && (
              <div className="p-2">
                {queue?.queue?.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.textSecondary }}>
                      Up Next
                    </p>
                    {queue.queue.slice(0, 20).map((track: any, index: number) => (
                      <div
                        key={`${track.id}-${index}`}
                        className="flex items-center p-2 rounded"
                        style={{ backgroundColor: `${currentTheme.backgroundSecondary}20` }}
                      >
                        <span className="text-xs w-6" style={{ color: currentTheme.textMuted }}>
                          {index + 1}
                        </span>
                        <img
                          src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                          alt=""
                          className="w-8 h-8 rounded mx-2"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: currentTheme.text }}>
                            {track.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: currentTheme.textSecondary }}>
                            {track.artists?.map((a: any) => a.name).join(', ')}
                          </p>
                        </div>
                        <span className="text-xs" style={{ color: currentTheme.textMuted }}>
                          {Math.floor(track.duration_ms / 60000)}:{(Math.floor(track.duration_ms / 1000) % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                    {queue.queue.length > 20 && (
                      <p className="text-xs text-center py-2" style={{ color: currentTheme.textMuted }}>
                        + {queue.queue.length - 20} more tracks
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: currentTheme.textMuted }}>
                    No tracks in queue
                  </p>
                )}
              </div>
            )}

            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <div className="p-2">
                {isLoadingRecommendations ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2" 
                      style={{ 
                        borderColor: currentTheme.primary + '20',
                        borderTopColor: currentTheme.primary 
                      }} 
                    />
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold mb-2" style={{ color: currentTheme.textSecondary }}>
                      Based on {playerState?.item?.name}
                    </p>
                    {recommendations.map((track: any) => (
                      <div
                        key={track.id}
                        className="flex items-center p-2 rounded hover:bg-opacity-10 cursor-pointer group"
                        style={{ backgroundColor: `${currentTheme.backgroundSecondary}00` }}
              onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}30`;
              }}
              onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${currentTheme.backgroundSecondary}00`;
                        }}
                        onClick={() => controls.playTrack(track.id)}
                      >
                        <img
                          src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                          alt=""
                          className="w-10 h-10 rounded"
                        />
                        <div className="flex-1 min-w-0 mx-3">
                          <p className="text-sm font-medium truncate" style={{ color: currentTheme.text }}>
                            {track.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: currentTheme.textSecondary }}>
                            {track.artists?.map((a: any) => a.name).join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            controls.addToQueue(`spotify:track:${track.id}`);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          style={{ color: currentTheme.primary }}
                        >
                          <PlusIcon className="w-4 h-4" />
            </button>
          </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: currentTheme.textMuted }}>
                    Play a track to get recommendations
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div 
          className="absolute top-2 right-2 text-xs p-2 rounded-lg flex items-center space-x-2"
          style={{
            backgroundColor: `${currentTheme.accent}90`,
            color: '#ffffff',
          }}
        >
          <span className="flex-1">{error}</span>
          <button 
            onClick={clearError} 
            className="text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Sleep Timer Notification */}
      {sleepTimer.isActive && (
        <div 
          className="absolute bottom-2 left-2 right-2 p-2 rounded-lg flex items-center justify-between text-xs"
          style={{
            backgroundColor: currentTheme.accent + '20',
            color: currentTheme.accent,
          }}
        >
          <span>Sleep timer: {sleepTimer.formattedTime}</span>
          <button
            onClick={() => sleepTimer.stopTimer()}
            className="underline hover:no-underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />

      {/* Audio Settings Modal */}
      <AudioSettings
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />

      {/* Lyrics Modal */}
      <Lyrics
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        trackName={playerState?.item?.name || ''}
        artistName={playerState?.item?.artists?.map(a => a.name).join(', ') || ''}
              currentProgress={currentProgress}
              isPlaying={is_playing}
            />
    </div>
  );
} 