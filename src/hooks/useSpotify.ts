import { useState, useEffect, useCallback } from 'react';
import * as spotify from '../api/spotify';

type SpotifyPlayerState = SpotifyApi.CurrentPlaybackResponse;

export const useSpotify = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(spotify.isAuthenticated());
  const [playerState, setPlayerState] = useState<SpotifyPlayerState | null>(null);

  const login = () => {
    spotify.login();
  };

  const pollPlayerState = useCallback(async () => {
    if (!spotify.isAuthenticated()) {
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);
    try {
      const state = await spotify.getPlaybackState();
      setPlayerState(state);
    } catch (error) {
      console.error('Error polling player state:', error);
      // If we get an auth error, the token might be expired
      if ((error as any).statusCode === 401) {
        setIsAuthenticated(false);
      }
    }
  }, []);

  useEffect(() => {
    // Initial check
    setIsReady(false);
    pollPlayerState().finally(() => setIsReady(true));

    // Poll every 3 seconds
    const interval = setInterval(pollPlayerState, 3000);
    return () => clearInterval(interval);
  }, [pollPlayerState]);
  
  const controls = {
    play: (options?: { context_uri?: string }) => spotify.play(options).then(pollPlayerState),
    pause: () => spotify.pause().then(pollPlayerState),
    next: () => spotify.skipToNext().then(pollPlayerState),
    previous: () => spotify.skipToPrevious().then(pollPlayerState),
    seek: (positionMs: number) => spotify.seek(positionMs).then(pollPlayerState),
  };

  return {
    isReady,
    isAuthenticated,
    playerState,
    login,
    controls
  };
}; 