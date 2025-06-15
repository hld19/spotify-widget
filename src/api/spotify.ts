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

// This function will be called by the component once the token is received.
export function setToken(accessToken: string, refreshToken?: string) {
  spotifyApi.setAccessToken(accessToken);
  localStorage.setItem('access_token', accessToken);
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
  await invoke('login');
}

async function spotifyApiRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error: any) {
    if (error.statusCode === 401) {
      try {
        await refreshAccessToken();
        return await request();
      } catch (refreshError) {
        console.error('Failed to refresh token, user needs to login again.', refreshError);
        throw new Error('Authentication failed. Please log in again.');
      }
    }
    throw error;
  }
}

export function getPlaybackState() {
  return spotifyApiRequest(() => spotifyApi.getMyCurrentPlaybackState().then(res => res.body));
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
  return spotifyApiRequest(() => spotifyApi.getMyRecentlyPlayedTracks({ limit: 4 }));
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    await login();
    throw new Error('No refresh token found.');
  }

  try {
    const response = await fetch('http://localhost:14700/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      await login();
      throw new Error('Failed to refresh access token.');
    }

    const data = await response.json();
    setToken(data.access_token, data.refresh_token || refreshToken);
  } catch (error) {
    console.error('Error refreshing token:', error);
    await login();
    throw error;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  spotifyApi.setAccessToken('');
}
