import SpotifyWebApi from 'spotify-web-api-node';
import { invoke } from '@tauri-apps/api/core';

const spotifyApi = new SpotifyWebApi();

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

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    logout();
    throw new Error('No refresh token found, please login again.');
  }
  logout();
  throw new Error('Session expired. Please log in again.');
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  spotifyApi.setAccessToken('');
} 