import SpotifyWebApi from 'spotify-web-api-node';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Basic interface for the token response from the backend
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

const spotifyApi = new SpotifyWebApi();

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// This function will be called by the component once the token is received.
export function setToken(accessToken: string, refreshToken?: string) {
  spotifyApi.setAccessToken(accessToken);
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('token_timestamp', Date.now().toString());
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
}

// Listen for the auth token from the backend
listen<TokenResponse>('spotify-auth-token', (event) => {
  const { access_token, refresh_token } = event.payload;
  setToken(access_token, refresh_token || undefined);
  // You might want to reload or notify the UI that login was successful
  window.location.reload(); 
});

// Initialize on load
const initialToken = localStorage.getItem('access_token');
if (initialToken) {
  spotifyApi.setAccessToken(initialToken);
}

export async function login() {
  try {
    await invoke('login');
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('Failed to initiate Spotify login');
  }
}

async function spotifyApiRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error: any) {
    console.error('Spotify API error:', error);
    
    if (error.statusCode === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      try {
        // If already refreshing, wait for that to complete
        if (isRefreshing && refreshPromise) {
          await refreshPromise;
        } else {
          await refreshAccessToken();
        }
        return await request();
      } catch (refreshError) {
        console.error('Failed to refresh token, user needs to login again.', refreshError);
        logout(); // Clear invalid tokens
        throw new Error('Your session has expired. Please log in again.');
      }
    }
    
    // Handle rate limiting
    if (error.statusCode === 429) {
      const retryAfter = error.headers?.['retry-after'] || 1;
      console.warn(`Rate limited, retrying after ${retryAfter} seconds`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return await request();
    }
    
    // Handle other API errors gracefully
    if (error.statusCode >= 500) {
      throw new Error('Spotify service is temporarily unavailable');
    }
    
    throw error;
  }
}

export function getPlaybackState() {
  return spotifyApiRequest(() => 
    spotifyApi.getMyCurrentPlaybackState().then(res => res.body)
  );
}

export function play(options?: { context_uri?: string }) {
  return spotifyApiRequest(() => spotifyApi.play(options));
}

export function pause() {
  return spotifyApiRequest(() => spotifyApi.pause());
}

export function skipToNext() {
  return spotifyApiRequest(() => spotifyApi.skipToNext());
}

export function skipToPrevious() {
  return spotifyApiRequest(() => spotifyApi.skipToPrevious());
}

export function seek(positionMs: number) {
  return spotifyApiRequest(() => spotifyApi.seek(positionMs));
}

export function getRecentlyPlayed() {
  return spotifyApiRequest(() => 
    spotifyApi.getMyRecentlyPlayedTracks({ limit: 4 }).then(res => res.body)
  );
}

export async function refreshAccessToken() {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  
  isRefreshing = true;
  
  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      isRefreshing = false;
      throw new Error('No refresh token found.');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('http://localhost:14700/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('Invalid response from refresh endpoint');
      }
      
      setToken(data.access_token, data.refresh_token || refreshToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // If refresh fails, clear tokens and force re-login
      logout();
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Token refresh timed out');
      }
      
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}

export function isAuthenticated() {
  const token = localStorage.getItem('access_token');
  const timestamp = localStorage.getItem('token_timestamp');
  
  if (!token) return false;
  
  // Check if token is older than 55 minutes (tokens expire in 1 hour)
  if (timestamp) {
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 55 * 60 * 1000; // 55 minutes in milliseconds
    
    if (tokenAge > maxAge) {
      console.log('Token is likely expired, will refresh on next API call');
    }
  }
  
  return true;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_timestamp');
  spotifyApi.setAccessToken('');
  isRefreshing = false;
  refreshPromise = null;
}
