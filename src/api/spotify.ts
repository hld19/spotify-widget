import SpotifyWebApi from 'spotify-web-api-node';
import { invoke } from '@tauri-apps/api/core';

const spotifyApi = new SpotifyWebApi();
const CLIENT_ID = '0d719dbb994743bc9a8af7a7d0b4f3f1';

// This function will be called by the component once the token is received.
export function setToken(accessToken: string, refreshToken?: string) {
  spotifyApi.setAccessToken(accessToken);
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
}

// Initialize on load
const initialToken = localStorage.getItem('access_token');
if (initialToken) {
  spotifyApi.setAccessToken(initialToken);
}

export async function login() {
  await invoke('login');
}

export async function getCurrentTrack() {
  try {
    const response = await spotifyApi.getMyCurrentPlayingTrack();
    return response.body;
  } catch (error: any) {
    console.error('Error getting current track:', error);
    if (error.statusCode === 401) {
      await refreshAccessToken();
      return getCurrentTrack();
    }
    throw error;
  }
}

export async function play() {
  try {
    await spotifyApi.play();
  } catch (error: any) {
    if (error.statusCode === 401) {
      await refreshAccessToken();
      return play();
    }
    throw error;
  }
}

export async function pause() {
  try {
    await spotifyApi.pause();
  } catch (error: any) {
    if (error.statusCode === 401) {
      await refreshAccessToken();
      return pause();
    }
    throw error;
  }
}

export async function skipToNext() {
  try {
    await spotifyApi.skipToNext();
  } catch (error: any) {
    if (error.statusCode === 401) {
      await refreshAccessToken();
      return skipToNext();
    }
    throw error;
  }
}

export async function skipToPrevious() {
  try {
    await spotifyApi.skipToPrevious();
  } catch (error: any) {
    if (error.statusCode === 401) {
      await refreshAccessToken();
      return skipToPrevious();
    }
    throw error;
  }
}

export async function seek(positionMs: number) {
  try {
    await spotifyApi.seek(positionMs);
  } catch (error: any) {
    if (error.statusCode === 401) {
      await refreshAccessToken();
      return seek(positionMs);
    }
    throw error;
  }
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) {
    console.log('No refresh token found, logging in');
    await login();
    return;
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
      throw new Error('Failed to refresh access token.');
    }

    const data = await response.json();
    setToken(data.access_token, data.refresh_token || refreshToken);
  } catch (error) {
    console.error('Error refreshing token:', error);
    await login();
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