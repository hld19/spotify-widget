import { useEffect, useState } from 'react';
import { getAuthUrl, getCurrentTrack, isAuthenticated, handleCallback } from '../api/spotify';
import Background from './Background';
import AlbumCover from './AlbumCover';
import Controls from './Controls';
import { listen } from '@tauri-apps/api/event';

const Player = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  useEffect(() => {
    // Listen for deep link events
    const unlisten = listen('tauri://deep-link', async (data) => {
      console.log('Deep link received:', data);
      try {
        const url = new URL(data.payload as string);
        if (url.protocol === 'spotify-widget:') {
          const urlParams = new URLSearchParams(url.search);
          const code = urlParams.get('code');
          if (code) {
            await handleCallback(code);
            loadCurrentTrack();
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
        setError('Failed to process authentication.');
      }
    });

    const initializeSpotify = async () => {
      try {
        // Check if we're returning from Spotify auth via query params (for development)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        
        if (errorParam) {
          setError(`Spotify authentication error: ${errorParam}`);
          setIsLoading(false);
          return;
        }
        
        if (code) {
          console.log("Received auth code in URL params, processing callback...");
          try {
            await handleCallback(code);
            // Remove the code from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            await loadCurrentTrack();
            return;
          } catch (error) {
            console.error('Error handling callback:', error);
            setError('Failed to authenticate with Spotify. Please try again.');
            setIsLoading(false);
            return;
          }
        }

        if (!isAuthenticated()) {
          console.log("Not authenticated, redirecting to Spotify login...");
          const authUrl = await getAuthUrl();
          console.log("Auth URL:", authUrl);
          window.location.href = authUrl;
          return;
        }

        await loadCurrentTrack();
      } catch (error) {
        console.error('Error in Spotify initialization:', error);
        setError('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    };

    const loadCurrentTrack = async () => {
      try {
        console.log("Authenticated, fetching current track...");
        const track = await getCurrentTrack();
        setCurrentTrack(track);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching track:', error);
        setError('Failed to load current track.');
        setIsLoading(false);
      }
    };

    initializeSpotify();

    // Clean up listener when component unmounts
    return () => {
      unlisten.then(unlistenFn => unlistenFn());
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
        <div className="text-white">No track playing</div>
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