import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { listen, Event } from '@tauri-apps/api/event';

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
    <div
      data-tauri-drag-region
      className="w-full h-full rounded-xl flex flex-col items-center justify-center bg-black bg-opacity-50"
    >
      <div className="absolute top-4 right-4">
        <button onClick={() => navigate('/settings')} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
      <div className="w-64 h-64">
        <img
          src={currentTrack.item?.album?.images[0]?.url}
          alt="Album Cover"
          className="w-full h-full rounded-md"
        />
      </div>
      <div className="text-center mt-4">
        <h2 className="text-xl font-bold text-white">{currentTrack.item?.name}</h2>
        <p className="text-sm text-gray-300">{currentTrack.item?.artists[0]?.name}</p>
      </div>
      <div className="w-64 mt-4">
        <div className="bg-gray-700 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full"
            style={{
              width: `${
                (currentTrack.progress_ms / currentTrack.item?.duration_ms) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>
      <div className="flex items-center space-x-4 mt-4">
        <button onClick={handlePrevious} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={handlePlayPause}
          className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center"
        >
          {currentTrack.is_playing ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
            </svg>
          )}
        </button>
        <button onClick={handleNext} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Player; 