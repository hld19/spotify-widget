import { useEffect, useState } from 'react';
import {
  getCurrentTrack,
  isAuthenticated,
  login,
  setToken,
  play,
  pause,
  skipToNext,
  skipToPrevious,
} from '../api/spotify';
import Background from './Background';
import AlbumCover from './AlbumCover';
import Controls from './Controls';
import { listen, Event } from '@tauri-apps/api/event';

interface AuthTokenPayload {
  access_token: string;
  refresh_token?: string;
}

const Player = () => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated());
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  useEffect(() => {
    const authListener = listen('spotify-auth-token', (event: Event<AuthTokenPayload>) => {
      const { access_token, refresh_token } = event.payload;
      setToken(access_token, refresh_token);
      setIsAuthenticatedState(true);
      loadCurrentTrack();
    });

    if (isAuthenticatedState) {
      loadCurrentTrack();
      const interval = setInterval(loadCurrentTrack, 3000); // Refresh every 3 seconds
      return () => {
        authListener.then((unlisten) => unlisten());
        clearInterval(interval);
      };
    }

    return () => {
      authListener.then((unlisten) => unlisten());
    };
  }, [isAuthenticatedState]);

  const loadCurrentTrack = async () => {
    try {
      setError(null);
      const track = await getCurrentTrack();
      setCurrentTrack(track);
    } catch (error: any) {
      console.error('Error fetching track:', error);
      if (error.message.includes('log in again')) {
        setIsAuthenticatedState(false);
      }
      setError('Failed to load current track.');
    }
  };

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (error) {
      console.error('Login failed', error);
      setError('Failed to initiate login.');
    }
  };

  const handlePlayPause = async () => {
    try {
      if (currentTrack?.is_playing) {
        await pause();
      } else {
        await play();
      }
      // Refresh track state immediately after action
      loadCurrentTrack();
    } catch (error) {
      console.error('Failed to toggle play/pause', error);
      setError('Failed to toggle play/pause.');
    }
  };

  const handleNext = async () => {
    try {
      await skipToNext();
      // Refresh track state immediately after action
      loadCurrentTrack();
    } catch (error) {
      console.error('Failed to skip to next track', error);
      setError('Failed to skip to next track.');
    }
  };

  const handlePrevious = async () => {
    try {
      await skipToPrevious();
      // Refresh track state immediately after action
      loadCurrentTrack();
    } catch (error) {
      console.error('Failed to skip to previous track', error);
      setError('Failed to skip to previous track.');
    }
  };

  if (!isAuthenticatedState) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Login with Spotify
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white">{error}</div>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div
        data-tauri-drag-region
        className="w-full h-full flex items-center justify-center"
      >
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" data-tauri-drag-region>
      <Background imageUrl={currentTrack.item?.album?.images[0]?.url} />
      <div className="relative z-10 p-4 flex items-center space-x-4">
        <AlbumCover imageUrl={currentTrack.item?.album?.images[0]?.url} />
        <Controls
          isPlaying={currentTrack.is_playing}
          trackName={currentTrack.item?.name}
          artistName={currentTrack.item?.artists[0]?.name}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>
    </div>
  );
};

export default Player; 