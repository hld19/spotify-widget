import { useEffect, useState } from 'react';
import { getCurrentTrack, isAuthenticated, login, setToken } from '../api/spotify';
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
    }

    return () => {
      authListener.then((unlisten) => unlisten());
    };
  }, []);

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
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Background imageUrl={currentTrack.item?.album?.images[0]?.url} />
      <div className="relative z-10 p-4">
        <AlbumCover imageUrl={currentTrack.item?.album?.images[0]?.url} />
        <Controls
          isPlaying={currentTrack.is_playing}
          trackName={currentTrack.item?.name}
          artistName={currentTrack.item?.artists[0]?.name}
        />
      </div>
    </div>
  );
};

export default Player; 