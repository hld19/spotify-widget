import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listen, Event } from '@tauri-apps/api/event';
import {
  getCurrentTrack,
  isAuthenticated,
  login,
  setToken,
  play,
  pause,
  skipToNext,
  skipToPrevious,
  seek,
} from '../api/spotify';
import Background from './Background';
import ProgressBar from './ProgressBar';

interface AuthTokenPayload {
  access_token: string;
  refresh_token?: string;
}

const Player = () => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated());
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authListener = listen('spotify-auth-token', (event: Event<AuthTokenPayload>) => {
      const { access_token, refresh_token } = event.payload;
      setToken(access_token, refresh_token);
      setIsAuthenticatedState(true);
      loadCurrentTrack();
    });

    const skipToNextListener = listen('skip-to-next', () => {
      handleNext();
    });

    const skipToPreviousListener = listen('skip-to-previous', () => {
      handlePrevious();
    });

    if (isAuthenticatedState) {
      loadCurrentTrack();
      const interval = setInterval(loadCurrentTrack, 3000); // Refresh every 3 seconds
      return () => {
        authListener.then((unlisten) => unlisten());
        skipToNextListener.then((unlisten) => unlisten());
        skipToPreviousListener.then((unlisten) => unlisten());
        clearInterval(interval);
      };
    }

    return () => {
      authListener.then((unlisten) => unlisten());
      skipToNextListener.then((unlisten) => unlisten());
      skipToPreviousListener.then((unlisten) => unlisten());
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
      loadCurrentTrack();
    } catch (error) {
      console.error('Failed to toggle play/pause', error);
      setError('Failed to toggle play/pause.');
    }
  };

  const handleNext = async () => {
    try {
      await skipToNext();
      loadCurrentTrack();
    } catch (error) {
      console.error('Failed to skip to next track', error);
      setError('Failed to skip to next track.');
    }
  };

  const handlePrevious = async () => {
    try {
      await skipToPrevious();
      loadCurrentTrack();
    } catch (error) {
      console.error('Failed to skip to previous track', error);
      setError('Failed to skip to previous track.');
    }
  };

  const handleSeek = async (positionMs: number) => {
    try {
      await seek(parseInt(positionMs as any, 10));
      loadCurrentTrack();
    } catch (error) {
      console.error('Failed to seek', error);
      setError('Failed to seek.');
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
        className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl"
      >
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const imageUrl = currentTrack.item?.album?.images[0]?.url;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Background imageUrl={imageUrl} />
      <div
        className="relative z-10 p-6 flex flex-col h-full bg-black/30 backdrop-blur-xl"
      >
        <div data-tauri-drag-region className="flex-grow flex flex-col items-center justify-center pt-4">
          <div className="w-48 h-48 md:w-56 md:h-56 shadow-lg rounded-lg overflow-hidden">
            <img src={imageUrl} alt="Album Cover" className="w-full h-full" />
          </div>
          <div className="text-center mt-6">
            <h2 className="text-2xl font-bold text-white truncate">{currentTrack.item?.name}</h2>
            <p className="text-base text-gray-300 truncate">{currentTrack.item?.artists[0]?.name}</p>
          </div>
        </div>

        <div className="flex-shrink-0 space-y-4">
          <ProgressBar
            progress={currentTrack.progress_ms}
            duration={currentTrack.item?.duration_ms}
            onSeek={handleSeek}
          />
          <div className="flex items-center justify-center space-x-8">
            <button onClick={handlePrevious} className="text-white opacity-70 hover:opacity-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 18L18 6L15 6L15 18L18 18Z" fill="currentColor"/>
                <path d="M13 12L6 6V18L13 12Z" fill="currentColor"/>
              </svg>
            </button>
            <button
              onClick={handlePlayPause}
              className="bg-white text-black rounded-full w-14 h-14 flex items-center justify-center"
            >
              {currentTrack.is_playing ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6H11V18H8V6Z" fill="currentColor"/>
                  <path d="M13 6H16V18H13V6Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              )}
            </button>
            <button onClick={handleNext} className="text-white opacity-70 hover:opacity-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H9V18H6V6Z" fill="currentColor"/>
                <path d="M11 12L18 18V6L11 12Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <button onClick={() => navigate('/settings')} className="text-white opacity-50 hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" fill="currentColor"/>
              <path d="M12 4C12.5523 4 13 3.55228 13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3C11 3.55228 11.4477 4 12 4Z" fill="currentColor"/>
              <path d="M12 22C12.5523 22 13 21.5523 13 21C13 20.4477 12.5523 20 12 20C11.4477 20 11 20.4477 11 21C11 21.5523 11.4477 22 12 22Z" fill="currentColor"/>
              <path d="M21 13C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11C20.4477 11 20 11.4477 20 12C20 12.5523 20.4477 13 21 13Z" fill="currentColor"/>
              <path d="M3 13C3.55228 13 4 12.5523 4 12C4 11.4477 3.55228 11 3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13Z" fill="currentColor"/>
              <path d="M18.364 19.364C18.7545 18.9734 18.7545 18.3403 18.364 17.9497C17.9734 17.5592 17.3403 17.5592 16.9497 17.9497L18.364 19.364ZM17.9497 16.9497L19.364 18.364L17.9497 16.9497Z" fill="currentColor"/>
              <path d="M4.63604 5.63604C5.02656 5.24551 5.02656 4.61235 4.63604 4.22182C4.24551 3.8313 3.61235 3.8313 3.22182 4.22182L4.63604 5.63604ZM4.22182 3.22182L5.63604 4.63604L4.22182 3.22182Z" fill="currentColor"/>
              <path d="M19.364 4.63604C18.9734 5.02656 18.3403 5.02656 17.9497 4.63604C17.5592 4.24551 17.5592 3.61235 17.9497 3.22182L19.364 4.63604ZM16.9497 4.22182L18.364 3.22182L16.9497 4.22182Z" fill="currentColor"/>
              <path d="M5.63604 18.364C5.24551 17.9734 4.61235 17.9734 4.22182 18.364C3.8313 18.7545 3.8313 19.3877 4.22182 19.7782L5.63604 18.364ZM3.22182 17.9497L4.63604 19.364L3.22182 17.9497Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player; 